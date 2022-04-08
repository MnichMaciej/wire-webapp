/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import React from 'react';
import {amplify} from 'amplify';
import {WebAppEvents} from '@wireapp/webapp-events';
import {Availability} from '@wireapp/protocol-messaging';

import {t} from 'Util/LocalizerUtil';
import {ContextMenuEntry} from '../../../ui/ContextMenu';
import Icon from 'Components/Icon';
import {CSS_SQUARE} from 'Util/CSSMixin';
import {CSSObject} from '@emotion/core';

interface AvailabilityInputProps {
  availability: Availability.Type;
}

const iconStyles: CSSObject = {
  ...CSS_SQUARE(10),
  fill: 'currentColor',
  margin: '0 6px 1px 0',
  minWidth: 10,
  stroke: 'currentColor',
};

const buttonStyles: CSSObject = {
  '&:first-child': {
    borderRadius: '12px 0px 0px 12px',
  },
  '&:last-child': {
    borderRadius: '0px 12px 12px 0px',
  },
  background: '#FFFFFF',
  border: '1px solid #DCE0E3',
  fontSize: '13px',
  fontWeight: 500,
  padding: '8px 12px',
};

const activeStyles: CSSObject = {
  background: '#E7F0FA',
  border: '1px solid #6AA4DE',
  color: '#0667C8',
};

const AvailabilityButtons: React.FC<AvailabilityInputProps> = ({availability}) => {
  const icons: {
    [key: string]: any;
  } = {
    [Availability.Type.AVAILABLE]: (
      <Icon.AvailabilityAvailable
        className="availability-state-icon"
        css={{...iconStyles, fill: '#1D7833', stroke: '#1D7833'}}
        data-uie-name="status-availability-icon"
        data-uie-value="available"
      />
    ),
    [Availability.Type.BUSY]: (
      <Icon.AvailabilityBusy
        className="availability-state-icon"
        css={{...iconStyles, fill: '#A25915', stroke: '#A25915'}}
        data-uie-name="status-availability-icon"
        data-uie-value="busy"
      />
    ),
    [Availability.Type.AWAY]: (
      <Icon.AvailabilityAway
        className="availability-state-icon"
        css={{...iconStyles, fill: '#C20013', stroke: '#C20013'}}
        data-uie-name="status-availability-icon"
        data-uie-value="away"
      />
    ),
    [Availability.Type.NONE]: null,
  };
  const entries: ContextMenuEntry[] = [
    {
      availability: Availability.Type.AVAILABLE,
      click: () => amplify.publish(WebAppEvents.USER.SET_AVAILABILITY, Availability.Type.AVAILABLE),
      label: t('userAvailabilityAvailable'),
    },
    {
      availability: Availability.Type.BUSY,
      click: () => amplify.publish(WebAppEvents.USER.SET_AVAILABILITY, Availability.Type.BUSY),
      label: t('userAvailabilityBusy'),
    },
    {
      availability: Availability.Type.AWAY,
      click: () => amplify.publish(WebAppEvents.USER.SET_AVAILABILITY, Availability.Type.AWAY),
      label: t('userAvailabilityAway'),
    },
    {
      availability: Availability.Type.NONE,
      click: () => amplify.publish(WebAppEvents.USER.SET_AVAILABILITY, Availability.Type.NONE),
      label: t('userAvailabilityNone'),
    },
  ];

  return (
    <div>
      {entries.map(item => {
        const isActive = availability === item.availability;

        return (
          <button
            key={item.availability}
            css={{...buttonStyles, ...(isActive ? activeStyles : {})}}
            type="button"
            onClick={() => item.click()}
          >
            {icons[item.availability]}
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default AvailabilityButtons;
