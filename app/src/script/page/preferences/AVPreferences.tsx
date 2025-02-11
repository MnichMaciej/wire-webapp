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
import {registerReactComponent, useKoSubscribableChildren} from 'Util/ComponentUtil';
import type {CallingRepository} from '../../calling/CallingRepository';
import type {MediaRepository} from '../../media/MediaRepository';
import type {PropertiesRepository} from '../../properties/PropertiesRepository';
import {t} from 'Util/LocalizerUtil';
import {DeviceTypes} from '../../media/MediaDevicesHandler';
import SaveCallLogs from './avPreferences/SaveCallLogs';
import CallOptions from './avPreferences/CallOptions';
import CameraPreferences from './avPreferences/CameraPreferences';
import MicrophonePreferences from './avPreferences/MicrophonePreferences';
import AudioOutPreferences from './avPreferences/AudioOutPreferences';
import PreferencesPage from './components/PreferencesPage';

interface AVPreferencesProps {
  callingRepository: CallingRepository;
  mediaRepository: MediaRepository;
  propertiesRepository: PropertiesRepository;
}

const AVPreferences: React.FC<AVPreferencesProps> = ({
  mediaRepository: {devicesHandler, constraintsHandler, streamHandler},
  propertiesRepository,
  callingRepository,
}) => {
  const deviceSupport = useKoSubscribableChildren(devicesHandler?.deviceSupport, [
    DeviceTypes.AUDIO_INPUT,
    DeviceTypes.AUDIO_OUTPUT,
    DeviceTypes.VIDEO_INPUT,
  ]);

  return (
    <PreferencesPage title={t('preferencesAV')}>
      {deviceSupport.audioInput && (
        <MicrophonePreferences
          {...{devicesHandler, streamHandler}}
          refreshStream={() => callingRepository.refreshAudioInput()}
        />
      )}
      {deviceSupport.audioOutput && <AudioOutPreferences {...{devicesHandler}} />}
      {deviceSupport.videoInput && (
        <CameraPreferences
          {...{devicesHandler, streamHandler}}
          refreshStream={() => callingRepository.refreshVideoInput()}
          hasActiveCameraStream={callingRepository.hasActiveCameraStream()}
        />
      )}
      <CallOptions {...{constraintsHandler, propertiesRepository}} />
      {callingRepository.supportsCalling && <SaveCallLogs {...{callingRepository}} />}
    </PreferencesPage>
  );
};

export default AVPreferences;

registerReactComponent('av-preferences', {
  component: AVPreferences,
  template: '<div data-bind="react: {callingRepository, mediaRepository, propertiesRepository}"></div>',
});
