/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */
 
"use strict";
import React from 'react';
import {Text} from 'react-native';

class InboxTemplateRegistry {
	constructor() {
		if(! InboxTemplateRegistry.instance) {
			this.messageViewRenderers = {};
			this.listItemRenderers = {};
			InboxTemplateRegistry.instance = this;
		}

		return InboxTemplateRegistry.instance;
	}

	registerMessageViewRenderer(templateName, renderer) {
		this.messageViewRenderers[templateName] = renderer;
	}

	registerListItemRenderer(templateName, renderer) {
		this.listItemRenderers[templateName] = renderer;
	}

	renderListItem(inboxMessage) {
		const renderer = this.listItemRenderers[inboxMessage.templateName];
		if(typeof(renderer) == "undefined") {
			return (
				<Text>List item renderer not definied for template named: {inboxMessage.templateName}</Text>
			);
		}
		return renderer(inboxMessage);
	}

	renderMessageView(inboxMessage) {
		const renderer = this.messageViewRenderers[inboxMessage.templateName];
		if(typeof(renderer) == "undefined") {
			return (
				<Text>Message View renderer not definied for template named: {inboxMessage.templateName}</Text>
			);
		}
		return renderer(inboxMessage);
	}
}
const instance = new InboxTemplateRegistry();
Object.freeze(instance);

export default instance;