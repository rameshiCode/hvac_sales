<template>
    <v-card>
        <v-card-title>
            Creare intermediar
        </v-card-title>
        <v-card-text>
                <v-text-field
                    label="Nume:"
                    id="name"
                    v-model="newIntermediary.name"
                    @blur="saveIntermediary"
                    outlined
                    dense
                ></v-text-field>
                <div v-if="error" class="text-danger">{{ error }}</div>

                <v-text-field
                    label="Telefon:"
                    id="phone"
                    v-model="newIntermediary.phone"
                    @blur="saveIntermediary"
                    outlined
                    dense
                ></v-text-field>

                <v-text-field
                    label="Email:"
                    id="email"
                    v-model="newIntermediary.email"
                    @blur="saveIntermediary"
                    outlined
                    dense
                ></v-text-field>

                <v-row v-if="!onClientCreation" class="my-2 mr-1 justify-end">
                    <v-btn @click="addIntermediary" color="primary">Adaugă intermediar</v-btn>
                </v-row>
        </v-card-text>
    </v-card>
</template>


<script>
import apiClient from "@/utils/apiClient";

export default {
    name: "CreateIntermediary",
    props: {
        onClientCreation: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            newIntermediary: {
                name: "",
                phone: "",
                email: "",
                agent_id: "",
            },
            error: ""
        };
    },
    methods: {
        saveIntermediary() {
            this.newIntermediary.agent_id = parseInt(sessionStorage.getItem('userId'));
            this.$emit("save-intermediary", this.newIntermediary);
        },
        async addIntermediary() {
            if (this.newIntermediary.name.trim() === "") {
                this.error = "Numele intermediarului nu poate fi gol.";
            } else {
                this.error = '';
                let agentId = sessionStorage.getItem('userId')
                const intermediary = {
                    name: this.newIntermediary.name,
                    phone: this.newIntermediary.phone,
                    email: this.newIntermediary.email,
                    agent_id: parseInt(agentId)
                };

                try {
                    const response = await apiClient.post('/api/create_intermediary/', intermediary);
                    const savedIntermediary = response.data.intermediate_data;
                    const intermediaries = JSON.parse(sessionStorage.getItem("intermediaries"));
                    intermediaries.push(savedIntermediary);
                    sessionStorage.setItem("intermediaries", JSON.stringify(intermediaries));
                    this.$emit("intermediary-created");

                    // Clear the input fields
                    this.newIntermediary.name = "";
                    this.newIntermediary.phone = "";
                    this.newIntermediary.email = "";
                } catch (error) {
                    console.error("Error adding intermediary:", error.response.data);
                }
            }
        },
    }
}
</script>

<style scoped>

</style>