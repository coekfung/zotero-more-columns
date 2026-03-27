import { assert } from "chai";
import { config } from "../package.json";
import hooks from "../src/hooks";
import {
  ITEM_LIST_COLUMN_KEYS,
  decodeNumericColumnValue,
  encodeNumericColumnValue,
  getAttachmentCountValue,
  getNoteCountValue,
  getTagCountValue,
} from "../src/modules/itemListColumns";

function createRegularItem(overrides?: {
  attachmentCount?: number;
  noteCount?: number;
  tagCount?: number;
}) {
  const attachmentCount = overrides?.attachmentCount ?? 0;
  const noteCount = overrides?.noteCount ?? 0;
  const tagCount = overrides?.tagCount ?? 0;

  return {
    isRegularItem: () => true,
    numAttachments: () => attachmentCount,
    numNotes: () => noteCount,
    getTags: () =>
      Array.from({ length: tagCount }, (_, index) => ({
        tag: `tag-${index}`,
      })),
  };
}

function createNonRegularItem() {
  return {
    isRegularItem: () => false,
    numAttachments: () => 99,
    numNotes: () => 99,
    getTags: () => [{ tag: "ignored" }],
  };
}

function getPluginInstance() {
  return Zotero[config.addonInstance];
}

describe("startup", function () {
  it("should have plugin instance defined", function () {
    assert.isNotEmpty(Zotero[config.addonInstance]);
  });

  it("should expose the expected MVP column keys", function () {
    assert.deepEqual(ITEM_LIST_COLUMN_KEYS, [
      "attachmentCount",
      "noteCount",
      "tagCount",
    ]);
  });

  it("should encode and decode numeric values for sortable columns", function () {
    const encodedValue = encodeNumericColumnValue(12);

    assert.equal(encodedValue, "00000012::12");
    assert.equal(decodeNumericColumnValue(encodedValue), "12");
  });

  it("should provide counts for regular items", function () {
    const item = createRegularItem({
      attachmentCount: 3,
      noteCount: 7,
      tagCount: 2,
    });

    assert.equal(getAttachmentCountValue(item), "00000003::3");
    assert.equal(getNoteCountValue(item), "00000007::7");
    assert.equal(getTagCountValue(item), "00000002::2");
  });

  it("should keep derived columns blank for non-regular items", function () {
    const item = createNonRegularItem();

    assert.equal(getAttachmentCountValue(item), "");
    assert.equal(getNoteCountValue(item), "");
    assert.equal(getTagCountValue(item), "");
  });

  it("should register all MVP columns during startup", async function () {
    const pluginInstance = getPluginInstance();
    const originalRegisterColumn = Zotero.ItemTreeManager.registerColumn;
    const originalLocale = pluginInstance.data.locale;
    const originalInitialized = pluginInstance.data.initialized;
    const registeredDataKeys: string[] = [];

    try {
      pluginInstance.data.initialized = false;
      pluginInstance.data.locale = {
        current: {
          formatMessagesSync: ([message]: Array<{ id: string }>) => [
            { value: message.id },
          ],
        },
      };
      Zotero.ItemTreeManager.registerColumn = ((column) => {
        registeredDataKeys.push(column.dataKey);
        return `${config.addonID}:${column.dataKey}`;
      }) as typeof Zotero.ItemTreeManager.registerColumn;

      await hooks.onStartup();

      assert.deepEqual(registeredDataKeys, [...ITEM_LIST_COLUMN_KEYS]);
      assert.isTrue(pluginInstance.data.initialized);
      assert.deepEqual(pluginInstance.data.registeredItemTreeColumns, [
        `${config.addonID}:attachmentCount`,
        `${config.addonID}:noteCount`,
        `${config.addonID}:tagCount`,
      ]);
    } finally {
      Zotero.ItemTreeManager.registerColumn = originalRegisterColumn;
      pluginInstance.data.locale = originalLocale;
      pluginInstance.data.initialized = originalInitialized;
      pluginInstance.data.registeredItemTreeColumns = [];
    }
  });

  it("should unregister tracked columns during shutdown", function () {
    const pluginInstance = getPluginInstance();
    const originalUnregisterColumn = Zotero.ItemTreeManager.unregisterColumn;
    const originalPluginInstance = Zotero[config.addonInstance];
    const originalAlive = pluginInstance.data.alive;
    const unregisteredDataKeys: string[] = [];

    try {
      pluginInstance.data.alive = true;
      pluginInstance.data.registeredItemTreeColumns = [
        "plugin:attachmentCount",
        "plugin:noteCount",
        "plugin:tagCount",
      ];
      Zotero.ItemTreeManager.unregisterColumn = ((dataKey) => {
        unregisteredDataKeys.push(dataKey);
        return true;
      }) as typeof Zotero.ItemTreeManager.unregisterColumn;

      hooks.onShutdown();

      assert.deepEqual(unregisteredDataKeys, [
        "plugin:attachmentCount",
        "plugin:noteCount",
        "plugin:tagCount",
      ]);
      assert.deepEqual(pluginInstance.data.registeredItemTreeColumns, []);
      assert.isFalse(pluginInstance.data.alive);
      assert.isUndefined(Zotero[config.addonInstance]);
    } finally {
      Zotero.ItemTreeManager.unregisterColumn = originalUnregisterColumn;
      pluginInstance.data.alive = originalAlive;
      pluginInstance.data.registeredItemTreeColumns = [];
      Zotero[config.addonInstance] = originalPluginInstance;
    }
  });
});
