import apiClient from "@/utils/apiClient";
import {fetchDocuments} from "@/utils/utils";

export default {
    data() {
        return {
            files: null,
        }
    },
    async created() {
        this.locationId = this.$route.params.locationId ? this.$route.params.locationId : this.location.id;
        this.files = await fetchDocuments(this.locationId);
    },
    methods: {
        // this method is used for uploading files to the back-end
        async updateFiles() {
            await apiClient
                .put("/api/locations/" + this.locationId + "/documents/", this.files)
                .then(async () => {
                    this.files = await fetchDocuments(this.locationId);
                })
                .catch((error) => {
                    console.log(error);
                });
        },
    },
    watch: {
        /**
         * Watches the 'files' data property for changes.
         * When 'files' changes, this watcher updates the session storage with the new files data,
         * associating it with the current location ID.
         */
        files: {
            handler: function (newFiles) {
                sessionStorage.setItem(
                    "files" + this.locationId,
                    JSON.stringify(newFiles)
                );
            },
            deep: true,
        },
    }
}