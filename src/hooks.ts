import {
  registerItemListColumns,
  unregisterItemListColumns,
} from "./modules/itemListColumns";
import { initLocale } from "./utils/locale";

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();
  registerItemListColumns();
  addon.data.initialized = true;
}

async function onMainWindowLoad(_win: _ZoteroTypes.MainWindow): Promise<void> {
  return;
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  return;
}

function onShutdown(): void {
  unregisterItemListColumns();
  addon.data.alive = false;
  Reflect.deleteProperty(Zotero, addon.data.config.addonInstance);
}

async function onNotify(
  _event: string,
  _type: string,
  _ids: Array<string | number>,
  _extraData: { [key: string]: any },
) {
  return;
}

async function onPrefsEvent(_type: string, _data: { [key: string]: any }) {
  return;
}

function onShortcuts(_type: string) {
  return;
}

function onDialogEvents(_type: string) {
  return;
}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onNotify,
  onPrefsEvent,
  onShortcuts,
  onDialogEvents,
};
