type CountableItem = Pick<
  Zotero.Item,
  "isRegularItem" | "numAttachments" | "numNotes" | "getTags"
>;

type ColumnKey = "attachmentCount" | "noteCount" | "tagCount";
type ColumnLabelKey = "column-attachments" | "column-notes" | "column-tags";

interface LocalizedPattern {
  value: string | null;
}

const NUMERIC_SORT_WIDTH = 8;
const NUMERIC_SORT_DELIMITER = "::";

export const ITEM_LIST_COLUMN_KEYS: readonly ColumnKey[] = [
  "attachmentCount",
  "noteCount",
  "tagCount",
];

export function encodeNumericColumnValue(value: number): string {
  const normalizedValue = Math.max(0, value);
  return `${String(normalizedValue).padStart(NUMERIC_SORT_WIDTH, "0")}${NUMERIC_SORT_DELIMITER}${normalizedValue}`;
}

export function decodeNumericColumnValue(value: string): string {
  const [, displayValue = value] = value.split(NUMERIC_SORT_DELIMITER);
  return displayValue;
}

export function getAttachmentCountValue(item: CountableItem): string {
  if (!item.isRegularItem()) {
    return "";
  }
  return encodeNumericColumnValue(item.numAttachments(false));
}

export function getNoteCountValue(item: CountableItem): string {
  if (!item.isRegularItem()) {
    return "";
  }
  return encodeNumericColumnValue(item.numNotes(false, false));
}

export function getTagCountValue(item: CountableItem): string {
  if (!item.isRegularItem()) {
    return "";
  }
  return encodeNumericColumnValue(item.getTags().length);
}

function getColumnLabel(labelKey: ColumnLabelKey): string {
  const pattern = addon.data.locale?.current.formatMessagesSync([
    {
      id: `${addon.data.config.addonRef}-${labelKey}`,
    },
  ])[0] as LocalizedPattern | undefined;

  return pattern?.value ?? labelKey;
}

function renderNumericColumnCell(
  _index: number,
  data: string,
  column: _ZoteroTypes.ItemTreeManager.ItemTreeColumnOptions & {
    className: string;
  },
  _isFirstColumn: boolean,
  doc: Document,
) {
  const span = doc.createElement("span");
  span.className = `cell ${column.className}`;
  span.textContent = decodeNumericColumnValue(data);
  return span;
}

function buildItemListColumns(): _ZoteroTypes.ItemTreeManager.ItemTreeCustomColumnOptions[] {
  return [
    {
      dataKey: "attachmentCount",
      label: getColumnLabel("column-attachments"),
      pluginID: addon.data.config.addonID,
      enabledTreeIDs: ["main"],
      fixedWidth: true,
      width: "84",
      dataProvider: (item) => getAttachmentCountValue(item),
      renderCell: renderNumericColumnCell,
      zoteroPersist: ["width", "hidden", "sortDirection"],
    },
    {
      dataKey: "noteCount",
      label: getColumnLabel("column-notes"),
      pluginID: addon.data.config.addonID,
      enabledTreeIDs: ["main"],
      fixedWidth: true,
      width: "72",
      dataProvider: (item) => getNoteCountValue(item),
      renderCell: renderNumericColumnCell,
      zoteroPersist: ["width", "hidden", "sortDirection"],
    },
    {
      dataKey: "tagCount",
      label: getColumnLabel("column-tags"),
      pluginID: addon.data.config.addonID,
      enabledTreeIDs: ["main"],
      fixedWidth: true,
      width: "64",
      dataProvider: (item) => getTagCountValue(item),
      renderCell: renderNumericColumnCell,
      zoteroPersist: ["width", "hidden", "sortDirection"],
    },
  ];
}

export function registerItemListColumns() {
  const registeredColumns = buildItemListColumns().map((column) =>
    Zotero.ItemTreeManager.registerColumn(column),
  );
  const successfulColumns = registeredColumns.filter(
    (dataKey): dataKey is string => typeof dataKey === "string",
  );
  const failedColumnCount = registeredColumns.filter(
    (dataKey) => typeof dataKey !== "string",
  ).length;

  if (failedColumnCount > 0) {
    throw new Error(
      `Failed to register ${failedColumnCount} Zotero item-list columns.`,
    );
  }

  addon.data.registeredItemTreeColumns = successfulColumns;
}

export function unregisterItemListColumns() {
  for (const dataKey of addon.data.registeredItemTreeColumns) {
    Zotero.ItemTreeManager.unregisterColumn(dataKey);
  }
  addon.data.registeredItemTreeColumns = [];
}
