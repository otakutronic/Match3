/**
 * @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License v. 2.0 as published by Mozilla.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Mozilla Public License v. 2.0 for more details.

 * You should have received a copy of the Mozilla Public License v. 2.0
 * along with the Game Closure SDK.  If not, see <http://mozilla.org/MPL/2.0/>.
 */
import src.lib.Enum as Enum;

exports.SCREEN_WIDTH = 320;
exports.SCREEN_HEIGHT = 480;
exports.DEVICE_HEIGHT = 320;
exports.BOARD_COLS = 6;
exports.BOARD_ROWS = 6;
exports.NUM_OF_TILE_TYPES = 5;
exports.TILE_SIZE = exports.SCREEN_WIDTH / exports.BOARD_COLS;
exports.BOARD_OFFSET = exports.SCREEN_HEIGHT - exports.BOARD_ROWS * exports.TILE_SIZE;
exports.BOARD_OFFSET2 = exports.DEVICE_HEIGHT - exports.BOARD_ROWS * exports.TILE_SIZE;
exports.TIME_LIMIT = 60000, //60 secs
exports.TILE_SPEED = 10;