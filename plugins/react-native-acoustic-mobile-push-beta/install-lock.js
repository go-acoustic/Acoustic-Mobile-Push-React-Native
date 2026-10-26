/*
 * Copyright © 2026 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

// npm runs the plugins' postinstall scripts in parallel, and they read, change and write the same app files
// (CampaignConfig.json, MceConfig.json, AndroidManifest.xml, Info.plist): one could read a file while another
// rewrote it ("Unexpected end of JSON input") or overwrite its changes. Each script holds this lock, a directory
// in the app, until it exits, so they run one at a time. A lock older than two minutes was left by a killed script.
//
// Every plugin's postinstall loads this file from this package (a peer dependency of each plugin), so there is one
// copy of the lock.

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const LOCK_NAME = ".acoustic-mobile-push-postinstall.lock";
const STALE_MS = 120000;
const RETRY_MS = 100;

function holdInstallLock(installDirectory) {
	if (!installDirectory) {
		return;
	}
	const lockPath = path.join(installDirectory, LOCK_NAME);
	const pause = new Int32Array(new SharedArrayBuffer(4));
	for (;;) {
		try {
			fs.mkdirSync(lockPath);
			break;
		} catch (error) {
			if (error.code !== "EEXIST") {
				console.log(chalk.yellow("Could not create " + lockPath + " (" + error.code + "); configuring without it."));
				return;
			}
		}
		try {
			if (Date.now() - fs.statSync(lockPath).mtimeMs > STALE_MS) {
				fs.rmSync(lockPath, { recursive: true, force: true });
			}
		} catch (error) {
			// Released between mkdirSync and statSync: try again at once.
			continue;
		}
		// Node allows Atomics.wait on the main thread: a synchronous sleep that uses no CPU.
		Atomics.wait(pause, 0, 0, RETRY_MS);
	}
	process.on("exit", () => fs.rmSync(lockPath, { recursive: true, force: true }));
}

module.exports = { holdInstallLock };
