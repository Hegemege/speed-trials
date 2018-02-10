
export default {
    methods: {
        isLocalStorageSupported() {
            const test = "test_isLocalStorageSupported";
            try {
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        },
    },
};
