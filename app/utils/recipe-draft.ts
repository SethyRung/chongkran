export type RecipeDraft = {
  title?: string;
  description?: string;
  image?: File;
  category?: string;
  difficulty?: RecipeResponse["difficulty"];
  cookTime?: number;
  tags?: string[];
  ingredients?: Partial<IngredientDto>[];
  steps?: { text?: string }[];
};

function connect() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("chongkran-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("recipes");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function draftTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await connect();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction("recipes", mode);
      const request = operation(transaction.objectStore("recipes"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export function readRecipeDraft(accountId: string) {
  return draftTransaction<RecipeDraft | undefined>("readonly", (store) => store.get(accountId));
}

export function writeRecipeDraft(accountId: string, draft: RecipeDraft | undefined) {
  return draft
    ? draftTransaction("readwrite", (store) => store.put(draft, accountId))
    : draftTransaction("readwrite", (store) => store.delete(accountId));
}
