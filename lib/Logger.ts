
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/* eslint-disable no-console */
export const logger = {
    info: (msg: string, data?: unknown) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data || '');
    },
    error: (msg: string, err: unknown) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err);
    },
    warn: (msg: string, data?: unknown) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data || '');
    }
};
