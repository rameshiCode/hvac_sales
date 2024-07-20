<template>
    <v-table>
        <thead>
        <tr>
            <th>Nume</th>
            <th>Modificat</th>
            <th>Creat</th>
            <th>Tip</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="file in documents" :key="file.name">
            <td>{{ file.name }}</td>
            <td>{{ formatDate(file.modified) }}</td>
            <td>{{ formatDate(file.created) }}</td>
            <td>{{ fileType(file.document) }}</td>

            <td>
                <v-container class="d-flex justify-content-between">
                    <v-btn icon
                           @click="handleFileRemoved(file)"

                           flat
                    >
                        <v-icon color="red">mdi-delete</v-icon>
                        <v-tooltip activator="parent"
                                   location="top"
                        >
                            Șterge fisier
                        </v-tooltip>
                    </v-btn>
                    <v-btn @click="startUpdate(file)" icon flat>
                        <v-icon>mdi-file-edit</v-icon>
                        <v-tooltip activator="parent"
                                   location="top"
                        >
                            Modifică fișier
                        </v-tooltip>
                    </v-btn>
                    <v-btn @click="downloadFile(file)" icon flat>
                        <v-icon>mdi-file-download</v-icon>
                        <v-tooltip activator="parent"
                                   location="top"
                        >
                            Descarcă fișier
                        </v-tooltip>
                    </v-btn>
                </v-container>
            </td>
        </tr>
        </tbody>
    </v-table>
</template>

<script>
export default {
    name: "FileList",
    props: {
        documents: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            files: [],
        };
    },
    methods: {
        /**
         * Formats a date string into the local date format.
         * @param {string} date - The date string to format.
         * @returns {string} The formatted date string.
         */
        formatDate(date) {
            return new Date(date).toLocaleDateString('ro-RO');
        },
        /**
         * Retrieves the file type from a file path.
         * @param {string} filePath - The full path of the file.
         * @returns {string} The file extension.
         */
        fileType(filePath) {
            //get the string after the last dot position in a string to determine the file type
            return filePath.split(".").pop();
        },
        /**
         * Emits an event when a file is removed.
         * @param {Object} file - The file object that has been removed.
         */
        handleFileRemoved(file) {
            this.$emit("file-removed", file);
        },
        /**
         * Emits an event to start updating a file.
         * @param {Object} file - The file object to be updated.
         */
        startUpdate(file) {
            this.$emit("update-file", file);
        },
        /**
         * Opens a new window to download the specified file.
         * @param {Object} file - The file object containing the URL to be downloaded.
         */
        downloadFile(file) {
            window.open(file.document);
        },
    },
};
</script>
