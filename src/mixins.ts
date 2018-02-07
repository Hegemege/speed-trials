
export default {
    methods: {
        isLocalStorageSupported() {
            var test = "test_isLocalStorageSupported";
            try {
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        }
    },
}