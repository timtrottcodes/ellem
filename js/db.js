/**
 * Ellem Database Layer
 * IndexedDB wrapper for storing server profiles, chat history, and prompts
 */

class EllemDB {
    constructor() {
        this.dbName = 'EllemDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Server Profiles Store
                if (!db.objectStoreNames.contains('serverProfiles')) {
                    const profileStore = db.createObjectStore('serverProfiles', { keyPath: 'id', autoIncrement: true });
                    profileStore.createIndex('name', 'name', { unique: false });
                    profileStore.createIndex('type', 'type', { unique: false });
                }

                // Chat History Store
                if (!db.objectStoreNames.contains('chatHistory')) {
                    const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id', autoIncrement: true });
                    chatStore.createIndex('title', 'title', { unique: false });
                    chatStore.createIndex('createdAt', 'createdAt', { unique: false });
                    chatStore.createIndex('serverProfileId', 'serverProfileId', { unique: false });
                }

                // Prompts Store
                if (!db.objectStoreNames.contains('prompts')) {
                    const promptStore = db.createObjectStore('prompts', { keyPath: 'id', autoIncrement: true });
                    promptStore.createIndex('title', 'title', { unique: false });
                    promptStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    promptStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * Generic method to add data to a store
     */
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to get data by ID
     */
    async get(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to get all data from a store
     */
    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to update data
     */
    async update(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic method to delete data
     */
    async delete(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get prompts by tag
     */
    async getPromptsByTag(tag) {
        const transaction = this.db.transaction(['prompts'], 'readonly');
        const store = transaction.objectStore('prompts');
        const index = store.index('tags');
        return new Promise((resolve, reject) => {
            const request = index.getAll(tag);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Export all data as JSON
     */
    async exportData() {
        const data = {
            serverProfiles: await this.getAll('serverProfiles'),
            chatHistory: await this.getAll('chatHistory'),
            prompts: await this.getAll('prompts'),
            exportDate: new Date().toISOString(),
            version: this.version
        };
        return data;
    }

    /**
     * Import data from JSON
     */
    async importData(data) {
        const stores = ['serverProfiles', 'chatHistory', 'prompts'];
        
        for (const storeName of stores) {
            if (data[storeName] && Array.isArray(data[storeName])) {
                for (const item of data[storeName]) {
                    // Remove the id to let auto-increment assign new IDs
                    const { id, ...itemWithoutId } = item;
                    await this.add(storeName, itemWithoutId);
                }
            }
        }
    }
}

// Create a global instance
const ellemDB = new EllemDB();
