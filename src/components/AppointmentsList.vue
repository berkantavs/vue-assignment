<template>
  <div class="mt-5 mb-5">
    <b-container fluid>
      <div class="appointments-list">
        <div class="filter-area mb-3 mt-2">
          <b-row>
            <b-col lg="2">
              <div class="avatar-container">
                <div v-for="(agent, index) in agents.slice(0, 5)" :key="index" class="avatar-wrapper">
                  <AgentAvatar :agent="agent" @selectedAgent="setSelectedAgent" @deselectedAgent="setDeselectedAgent" />
                </div>
                <div v-if="agents.length > 5" class="avatar-wrapper">
                  <b-avatar class="agent-avatar-item" style="background-color: #ccc;">
                    +{{ agents.length - 5 }}
                  </b-avatar>
                </div>
              </div>
            </b-col>
            <b-col lg="6">
              <b-row>
                <b-col>
                  <div class="status-select-box-area">
                    <b-form-select v-model="selectedStatus" :options="statuses"></b-form-select>
                  </div>
                </b-col>
                <b-col>
                  <div class="date-selector-area position-relative">
                    <label for="filterStartDate" class="form-label">From</label>
                    <date-pick v-model="filterStartDate" :pickTime="true" :format="'MM/DD/YYYY HH:mm'"></date-pick>
                  </div>
                </b-col>
                <b-col>
                  <div class="date-selector-area position-relative">
                    <label for="filterStartDate" class="form-label">To</label>
                    <date-pick v-model="filterEndDate" :pickTime="true" :format="'MM/DD/YYYY HH:mm'"></date-pick>
                  </div>
                </b-col>
              </b-row>
            </b-col>
            <b-col lg="4">
              <div class="d-flex justify-content-end search-input-area">
                <b-input-group class="w-75">
                  <b-form-input type="text" v-model="searchQuery" class="text-center"
                    placeholder="Search"></b-form-input>
                  <b-input-group-append>
                    <b-button variant="dark">
                      <b-icon icon="search" font-scale="0.9"></b-icon>
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </div>
            </b-col>
          </b-row>
        </div>
        <div class="create-area pb-3">
          <b-row>
            <b-col md="4">
              <b style="vertical-align:-webkit-baseline-middle">{{ filteredRecords.length }} Appointments found.</b>
            </b-col>
            <b-col md="4" offset-md="4">
              <div class="create-btn-area text-end">
                <b-button variant="primary" @click="showModal()">
                  <b-icon icon="plus-circle" font-scale="1.1" class="mx-1"></b-icon> Create Appointment
                </b-button>
              </div>
            </b-col>
          </b-row>
        </div>
        <div class="list-area mt-3 mb-3" v-if="filteredRecords && filteredRecords.length > 0">
          <template v-for="(record, index) in paginatedRecords">
            <AppointmentsListItem :allRecords="records" :record="record" :agents="agents" :key="index" :index="index" :contacts="contacts" />
          </template>
        </div>
        <div class="text-center" v-else>
          No data found.
        </div>
        <div class="d-flex justify-content-end ">
          <b-pagination v-if="totalPages > 1" v-model="currentPage" :total-rows="filteredRecords.length"
            hide-goto-end-buttons :per-page="itemsPerPage" :limit="totalPages" aria-controls="appointments-list"
            class="mt-3"></b-pagination>
        </div>
      </div>
    </b-container>
    <NewAppointmentModal :contacts="contacts" :agents="agents" />
  </div>
</template>

<script>
import { fetchRecords } from '../services/appointmentsService';
import { fetchAgents } from '../services/agentsService';
import { fetchContacts } from '../services/contactService';
import AgentAvatar from "./AgentAvatar";
import AppointmentsListItem from "./AppointmentsListItem.vue";
import NewAppointmentModal from "./NewAppointmentModal.vue";
import DatePick from 'vue-date-pick';
import 'vue-date-pick/dist/vueDatePick.css';

export default {
  components: {
    AgentAvatar,
    DatePick,
    AppointmentsListItem,
    NewAppointmentModal
  },
  data() {
    return {
      records: [],
      agents: [],
      contacts: [],
      selectedAgents: [],
      selectedStatus: null,
      statuses: [
        { value: null, text: 'All Statuses' },
        { value: 'cancelled', text: 'Cancelled' },
        { value: 'upcoming', text: 'Upcoming' },
        { value: 'completed', text: 'Completed' },
      ],
      filterStartDate: '',
      filterEndDate: '',
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: ''
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
    },
    paginatedRecords() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRecords.slice(start, end);
    },
    filteredRecords() {
      let filtered = [...this.records];

      if (this.selectedStatus && this.selectedStatus !== 'All Statuses') {
        filtered = filtered.filter(record => record.fields.status === this.selectedStatus.toLowerCase());
      }

      if (this.selectedAgents.length > 0) {
        filtered = filtered.filter(record => {
          if (record.fields.agent_id) {
            const recordAgentIds = record.fields.agent_id;
            return this.selectedAgents.some(agent => recordAgentIds.includes(agent.id));
          }
        });
      }
      if (this.filterStartDate && this.filterEndDate) {
        const startDate = new Date(this.filterStartDate);
        const endDate = new Date(this.filterEndDate);
        console.log(startDate, 'start date');
        console.log(endDate, 'end date');
        filtered = filtered.filter(record => {
          const appointmentDate = new Date(record.fields.appointment_date);
          console.log(appointmentDate, 'appointment date');
          return appointmentDate >= startDate && appointmentDate <= endDate;
        });
      }
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(record =>
          record.fields.appointment_address.toLowerCase().includes(query) ||
          record.fields.contact_name[0].toLowerCase().includes(query) ||
          record.fields.contact_phone[0].toString().includes(query) ||
          record.fields.contact_email[0].toLowerCase().includes(query)
        );
      }
      return filtered;
    },
  },

  async created() {
    await this.fetchAppointments();
    await this.fetchAgents();
    await this.fetchContacts();
  },

  methods: {
    showModal() {
      this.$bvModal.show('new-appointment-modal');
    },
    setSelectedAgent(agent) {
      if (!this.selectedAgents.includes(agent)) {
        this.selectedAgents.push(agent);
      }
    },
    setDeselectedAgent(agent) {
      const index = this.selectedAgents.indexOf(agent);
      if (index !== -1) {
        this.selectedAgents.splice(index, 1);
      }
    },
    async fetchAppointments() {
      const tableName = 'Appointments';
      try {
        this.records = await fetchRecords(tableName);

        this.records.forEach(record => {
          const appointmentDate = new Date(record.fields.appointment_date);
          const currentDate = new Date();

          if (record.fields.is_cancelled) {
            record.fields.status = 'cancelled';
          } else if (appointmentDate > currentDate) {
            record.fields.status = 'upcoming';
          } else {
            record.fields.status = 'completed';
          }
        });

        this.records.sort((a, b) => new Date(b.fields.appointment_date) - new Date(a.fields.appointment_date));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async fetchAgents() {
      const tableName = 'Agents';
      try {
        this.agents = await fetchAgents(tableName);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    async fetchContacts() {
      const tableName = 'Contacts';
      try {
        this.contacts = await fetchContacts(tableName);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  }
};
</script>
