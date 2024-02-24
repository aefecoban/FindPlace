export default class CacheSystem {
    private static instance: CacheSystem = new CacheSystem();
    private cache: Map<string, any> = new Map<string, any>();

    private constructor() {}

    public static getInstance(): CacheSystem {
        return CacheSystem.instance;
    }

    public static CreateKey(key: any): string {
        if (Array.isArray(key)) {
            key = key.join(",");
        } else if (typeof key === 'object') {
            key = JSON.stringify(key);
        } else {
            key = key.toString();
        }
        console.log("create key",key);
        return Buffer.from(key).toString("base64");
    }

    public IsExists(key: string): boolean {
        return CacheSystem.instance.cache.has(key);
    }

    public Get(key: string): any {
        console.log("CACHE GET");
        return CacheSystem.instance.cache.get(key) ?? null;
    }

    public Set(key: string, value: any): void {
        console.log("CACHE SET", key);
        CacheSystem.instance.cache.set(key, value);
    }

    public Remove(key: string): void {
        CacheSystem.instance.cache.delete(key);
    }
}
