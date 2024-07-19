<template>
    <div class="appointment-modal">
        <b-modal hide-backdrop id="new-appointment-modal" hide-header-close hide-footer header-class="d-block"
            content-class="grey-background" static>
            <template #modal-header="{}">
                <div class="text-center">
                    <b-icon class="me-2" icon="calendar-plus" font-scale="1.1"></b-icon>
                    <b>Create an Appointment</b>
                </div>
            </template>
            <div class="search-contact-area">
                <ContactSearch :contacts="contacts" @setContact="setContact" />
            </div>
            <div class="appointment-address-input-area mt-3">
                <b-form-input type="text" v-model="appointmentAddress" placeholder="Address"></b-form-input>
            </div>
            <div class="status-select-box-area mt-3">
                <VueSelect multiple v-model="selectedAgent" :options="agentList" placeholder="Agent" />
            </div>
            <div class="date-selector-area mt-3">
                <flat-pickr :model-value="appointmentDate" :config="config"
                    @update:modelValue="appointmentDate = $event" class="form-control"></flat-pickr>
            </div>
            <div class="submit-button-area mt-3 text-end">
                <b-button variant="primary" @click="submitAppointment">Submit</b-button>
            </div>
        </b-modal>
    </div>
</template>

<script>
import ContactSearch from './ContactSearch';
import VueSelect from 'vue-select';
import 'flatpickr/dist/flatpickr.css';
import FlatPickr from 'vue-flatpickr-component';
import { createRecords } from '../services/appointmentsService';

export default {
    components: {
        ContactSearch,
        VueSelect,
        flatPickr: FlatPickr,
    },
    props: ['contacts', 'agents'],
    data() {
        return {
            selectedContact: null,
            appointmentAddress: null,
            selectedAgent: null,
            appointmentDate: '',
            config: {
                enableTime: true,
                time_24hr: true,
            },
        };
    },
    computed: {
        agentList() {
            return this.agents.map(agent => ({
                id: agent.id,
                label: `${agent.fields.agent_name} ${agent.fields.agent_surname}`,
            }));
        },
    },
    methods: {
        setContact(contact) {
            this.selectedContact = contact;
        },
        formatDateToISO(dateString) {
            const date = new Date(dateString);
            return date.toISOString();
        },
        async submitAppointment() {
            try {
                const formattedDate = this.formatDateToISO(this.appointmentDate);
                const newRecords = [
                    {
                        appointment_date: formattedDate,
                        appointment_address: this.appointmentAddress,
                        contact_id: [this.selectedContact.id],
                        agent_id: this.selectedAgent.map(agent => agent.id),
                        is_cancelled: false // Set default value for is_cancelled
                    }
                ];
                const response = await createRecords('Appointments', newRecords, true);
                console.log('Records created:', response);
                // Reset form or close modal after success
                this.resetForm();
                this.$bvModal.hide('new-appointment-modal');
            } catch (error) {
                console.error('Error creating appointment:', error);
            }
        },
        resetForm() {
            this.selectedContact = null;
            this.appointmentAddress = null;
            this.selectedAgent = null;
            this.appointmentDate = '';
        }
    },
};
</script>

<style scoped>
.grey-background {
    background-color: #f8f9fa;
}
</style>