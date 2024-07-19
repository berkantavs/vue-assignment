<template>
    <div class="appointment-modal">
        <b-modal hide-backdrop :id="'appointment-modal-' + record?.id" hide-footer hide-header-close
            header-class="d-block" content-class="grey-background">
            <template #modal-header="{}">
                <div class="text-center">
                    <b-icon class="me-2" icon="calendar-plus" font-scale="1.1"></b-icon>
                    <b>Edit appointment</b>
                </div>
            </template>
            <div class="search-contact-area">
                <ContactSearch :contacts="contacts" @setContact="setContact" :selectedContactInfo="selectedContact"
                    :formType="'edit'" />
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
            <div class="related-appointments-area mt-3"
                v-if="relatedAppointmentsStatus && relatedAppointmentsStatus.length > 0">
                <b>Related Appointments</b>
                <div class="mt-2">
                    <template v-for="(status, index) in relatedAppointmentsStatus">
                        <div class="mb-2" :key="index">
                            <div class="appointment-status-box bg-primary">
                                <b-row class="m-0">
                                    <b-col lg="6" class="status-area text-center">
                                        <b-row>
                                            <b-col :lg="status.remainingText === '' ? '12' : 6">
                                                <span class="p-1" :style="'color:' + status.statusColor">{{
                                                    status.status }}</span>
                                            </b-col>
                                            <b-col :lg="status.remainingText === '' ? '12' : 6">
                                                <span>{{ status.remainingText }}</span>
                                            </b-col>
                                        </b-row>
                                    </b-col>
                                    <b-col lg="6" class="date-area text-center">
                                        <b-icon class="text-white" font-scale="0.9" icon="clock"></b-icon>
                                        <span class="text-white ms-1" style="font-size: 14px;">{{
                                            formatAppointmentDate(status.date) }}</span>
                                    </b-col>
                                </b-row>
                            </div>
                        </div>
                    </template>
                </div>
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
import { updateRecords } from '../services/appointmentsService';

export default {
    props: ["allRecords", 'record', "contacts", "agents"],
    components: {
        ContactSearch,
        VueSelect,
        flatPickr: FlatPickr,
    },
    data() {
        return {
            selectedContact: null,
            appointmentAddress: null,
            selectedAgent: [],
            appointmentDate: '',
            selectedContactId: null,
            config: {
                enableTime: true,
                time_24hr: true,
            },
            relatedAppointmentsStatus: []
        };
    },
    watch: {
        record: {
            handler(newVal) {
                if (newVal && newVal.fields) {
                    this.initializeEditForm()
                } else {
                    console.log('record is null or does not have fields');
                }
            },
            immediate: true
        },
        relatedAppointments: {
            immediate: true,
            handler() {
                this.calculatePositiveHoursAndDays();
            }
        }
    },
    computed: {
        agentList() {
            return this.agents.map(agent => ({
                id: agent?.id,
                label: `${agent?.fields?.agent_name} ${agent?.fields?.agent_surname}`,
            }));
        },
        relatedAppointments() {
            return this.allRecords.filter(appointment =>
                this.selectedContact?.fields?.appointments.includes(appointment?.id)
            );
        }
    },
    methods: {
        calculatePositiveHoursAndDays() {
            this.relatedAppointmentsStatus = this.relatedAppointments.map(appointment => {
                const start = new Date();
                const end = new Date(appointment?.fields.appointment_date);
                let difference = end - start;
                const millisecondsPerSecond = 1000;
                const secondsPerMinute = 60;
                const minutesPerHour = 60;
                const hoursPerDay = 24;

                let milliseconds = difference % millisecondsPerSecond;
                difference = (difference - milliseconds) / millisecondsPerSecond;
                let seconds = difference % secondsPerMinute;
                difference = (difference - seconds) / secondsPerMinute;
                let minutes = difference % minutesPerHour;
                difference = (difference - minutes) / minutesPerHour;
                let hours = difference % hoursPerDay;
                let days = (difference - hours) / hoursPerDay;

                days = Math.max(0, days);
                hours = Math.max(0, hours);

                let remainingText = '';
                if (days > 0) {
                    remainingText = `${days} days`;
                } else if (days <= 0 && hours > 0) {
                    remainingText = `${hours} hours`;
                }

                let status = '';
                let statusColor = '';
                const now = new Date();
                if (appointment?.fields?.is_cancelled) {
                    status = 'Cancelled';
                    statusColor = '#ff0000';
                    remainingText = '';
                } else if (end > now) {
                    status = 'Upcoming';
                    statusColor = '#ffa500';
                } else {
                    status = 'Completed';
                    statusColor = '#008000';
                    remainingText = '';
                }

                return {
                    date: appointment?.fields?.appointment_date,
                    status,
                    statusColor,
                    remainingText
                };
            });
        },
        formatAppointmentDate(dateString) {
            if (dateString) {
                const date = new Date(dateString);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const year = date.getUTCFullYear();
                const hours = String(date.getUTCHours()).padStart(2, '0');
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');

                return `${day}/${month}/${year} ${hours}:${minutes}`;
            }
        },
        initializeEditForm() {
            if (this.contacts && this.record?.fields?.contact_id) {
                const contact = this.contacts.find(contact => contact?.id === this.record?.fields?.contact_id[0]);
                if (contact) {
                    this.selectedContact = contact;
                }
            }
            if (this.record?.fields?.appointment_address) {
                this.appointmentAddress = this.record?.fields?.appointment_address;
            }
            if (this.record.fields.agent_id) {
                this.selectedAgent = this.record.fields?.agent_id.map((id, index) => ({
                    id: id,
                    label: `${this.record?.fields?.agent_name[index]} ${this.record?.fields?.agent_surname[index]}`,
                }));
            }
            if (this.record?.fields?.appointment_date) {
                this.appointmentDate = this.record?.fields?.appointment_date;
            }
        },
        setContact(contact) {
            this.selectedContact = contact;
        },

        async submitAppointment() {
            const updatedAppointment = {
                id: this.record?.id,
                fields: {
                    appointment_date: this.appointmentDate,
                    appointment_address: this.appointmentAddress,
                    contact_id: [this.selectedContact?.id],
                    agent_id: this.selectedAgent.map(agent => agent?.id)
                }
            };

            try {
                const response = await updateRecords('Appointments', [updatedAppointment]);
                console.log('Appointment updated:', response);
            } catch (error) {
                console.error('Error updating appointment:', error);
            }
        }
    }
};
</script>
