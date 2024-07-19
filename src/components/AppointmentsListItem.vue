<template>
    <div :class="['appointment-item', { 'grey-background': index % 2 === 0, 'white-background': index % 2 !== 0 }]"
        @click="showModal(record)">
        <b-row>
            <b-col lg="3">
                <div class="contact-name mb-2">
                    <b-icon icon="person" font-scale="1.1" class="me-2"></b-icon>
                    <b>{{ record.fields.contact_name[0] + ' ' + record.fields.contact_surname[0] }}</b>
                </div>

                <div class="contact-mail mb-2">
                    <b-icon icon="mailbox" font-scale="1.1" class="me-2"></b-icon>
                    {{ record.fields.contact_email[0] }}
                </div>

                <div class="contact-phone mb-2">
                    <b-icon icon="phone" font-scale="1.1" class="me-2"></b-icon>
                    {{ record.fields.contact_phone[0] }}
                </div>
            </b-col>
            <b-col lg="3" class="appointment_address_container">
                <div class="appointment-address mb-2">
                    <b-icon icon="house-door" font-scale="1.5" class="me-2"></b-icon>
                    <b style="font-size: 15px;">{{ record.fields.appointment_address }}</b>
                </div>
            </b-col>
            <b-col lg="3" class="appointment_address_container">
                <div class="appointment-status-box bg-primary">
                    <b-row class="m-0">
                        <b-col lg="6" class="status-area text-center">
                            <b-row>
                                <b-col :lg="recordRemainingText == '' ? '12' : 6">
                                    <span class="p-1" :style="'color:' + recordStatusColor">{{ recordStatus }}</span>
                                </b-col>
                                <b-col :lg="recordRemainingText == '' ? '12' : 6">
                                    <span>{{ recordRemainingText }}</span>
                                </b-col>
                            </b-row>
                        </b-col>
                        <b-col lg="6" class="date-area text-center">
                            <b-icon class="text-white" font-scale="0.9" icon="clock"></b-icon>
                            <span class="text-white ms-1" style="font-size: 14px;">{{
                                formatAppointmentDate(record?.fields?.appointment_date) }}</span>
                        </b-col>
                    </b-row>
                </div>
            </b-col>
            <b-col lg="3" v-if="agentsForAppointment" class="avatar-container">
                <div v-for="(agent, index) in agentsForAppointment" :key="index" class="avatar-wrapper">
                    <AgentAvatar :agent="agent" />
                </div>
            </b-col>
        </b-row>
        <AppointmentModal :allRecords="allRecords" :contacts="contacts" :record="selectedRecord ? record : null"
            :agents="agents" />
    </div>
</template>

<script>
import AgentAvatar from './AgentAvatar.vue';
import AppointmentModal from './EditAppointmentModal.vue'
export default {
    props: ["allRecords", 'record', 'index', 'agents', "contacts"],
    components: { AgentAvatar, AppointmentModal },
    data() {
        return {
            recordStatus: '',
            recordStatusColor: '',
            recordRemainingText: '',
            selectedRecord: null,
        };
    },
    computed: {
        agentsForAppointment() {
            if (!this.record || !this.record.fields || !this.record.fields.agent_id || !this.agents) {
                return [];
            }
            return this.record.fields.agent_id.map(agentId => {
                const agent = this.agents.find(agent => agent.id === agentId) || {};
                return {
                    fields: {
                        agent_name: agent?.fields?.agent_name || '',
                        agent_surname: agent?.fields?.agent_surname || '',
                        agent_id: agent.id || '',
                        color: agent?.fields?.color || ''
                    }
                };
            });
        }
    },
    watch: {
        record: {
            immediate: true,
            handler(newValue, oldValue) {
                if (newValue !== oldValue) {
                    this.calculatePositiveHoursAndDays();
                }
            }
        }
    },
    methods: {
        showModal(record) {
            this.selectedRecord = record;
            this.$nextTick(() => {
                this.$bvModal.show(`appointment-modal-${record.id}`);
            });
        },
        calculatePositiveHoursAndDays() {
            const start = new Date();
            const end = new Date(this.record?.fields?.appointment_date);
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

            if (days > 0) {
                this.recordRemainingText = `${days} days`;
            } else if (days <= 0 && hours > 0) {
                this.recordRemainingText = `${hours} hours`;
            }

            const now = new Date();
            if (this.record?.fields?.is_cancelled) {
                this.recordStatus = 'Cancelled';
                this.recordStatusColor = '#ff0000';
                this.recordRemainingText = ''
                return;
            } else if (end > now) {
                this.recordStatus = 'Upcoming';
                this.recordStatusColor = '#ffa500';
                return;
            } else {
                this.recordStatus = 'Completed';
                this.recordStatusColor = '#008000';
                this.recordRemainingText = ''
            }
        },
        formatAppointmentDate(dateString) {
            const date = new Date(dateString);
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const year = date.getUTCFullYear();
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
    }
};
</script>
