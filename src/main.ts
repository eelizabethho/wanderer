// STUB: coordinator writes the real loop after the agents finish.
import { createRenderer } from './ascii';
import { FRAMES, drawSprite } from './sprite';
import { MODES } from './modes';
import { watchTrack, control } from './spotify';
import { mountNowPlaying } from './nowPlaying';

void [createRenderer, FRAMES, drawSprite, MODES, watchTrack, control, mountNowPlaying];
