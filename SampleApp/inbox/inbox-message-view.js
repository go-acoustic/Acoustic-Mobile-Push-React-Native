/*
 * Copyright © 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 */

import React from 'react';

import InboxTemplateRegistry from './inbox-template-registry';

export class InboxMessageView extends React.Component {
  state = {
    inboxMessage: this.props.inboxMessage,
  };

  render() {
    const { inboxMessage } = this.state;

    return InboxTemplateRegistry.renderMessageView(inboxMessage);
  }
}
