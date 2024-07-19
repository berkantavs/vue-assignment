<template>
    <div class="contact-search">
        <b-input-group v-if="showSearchBar">
            <b-form-input type="text" v-model="searchQuery" class="text-center" placeholder="Search"></b-form-input>
            <b-input-group-append>
                <b-button variant="dark">
                    <b-icon icon="search" font-scale="0.9"></b-icon>
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <ul class="search-results" v-if="searchResults && searchResults.length > 0">
            <li v-for="result in searchResults" :key="result.id">
                <div @click="setSelectedContact(result)" class="search-list-item">
                    <span class="d-block">
                        {{ result.fields.contact_name }} {{ result.fields.contact_surname }}
                    </span>
                    <span class="d-block">
                        {{ result.fields.contact_email }}
                    </span>
                </div>
            </li>
        </ul>
        <div class="contact-info-area position-relative" v-if="computedSelectedContact">
            <div class="remove-contact-btn position-absolute" style="top: 0px; right: 0px;">
                <b-button variant="transparent" @click="removeContact">
                    <b-icon icon="x"></b-icon>
                </b-button>
            </div>
            <div class="contact-name mb-2">
                <b-icon icon="person" font-scale="1.1" class="me-2"></b-icon>
                <b>{{ computedSelectedContact.fields.contact_name + ' ' + computedSelectedContact.fields.contact_surname
                    }}</b>
            </div>

            <div class="contact-mail mb-2">
                <b-icon icon="mailbox" font-scale="1.1" class="me-2"></b-icon>
                {{ computedSelectedContact.fields.contact_email }}
            </div>

            <div class="contact-phone mb-2">
                <b-icon icon="phone" font-scale="1.1" class="me-2"></b-icon>
                {{ computedSelectedContact.fields.contact_phone }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["selectedContactInfo", "contacts", "formType"],
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            selectedContact: null,
            showSearchBar: this.formType == 'edit' ? false : true,
        }
    },
    computed: {
        computedSelectedContact() {
            return this.formType ? this.selectedContactInfo : this.selectedContact;
        }
    },
    methods: {
        setSelectedContact(result) {
            this.selectedContact = result;
            this.$emit('setContact', result)
            this.searchResults = []
            this.showSearchBar = false;
        },
        removeContact() {
            this.selectedContact = null;
            this.$emit('setContact', null);
            this.showSearchBar = true;
        },
        async search() {
            try {
                this.searchResults = this.contacts.filter(item =>
                    item.fields.contact_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    item.fields.contact_email.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            } catch (error) {
                console.error('Error fetching data:', error);
                // Hata durumunu ele almak için uygun işlemler buraya eklenebilir
            }
        }
    },
    watch: {
        searchQuery: {
            handler() {
                this.search();
                if (this.searchQuery == '') {
                    this.searchResults = []
                }
            },
            immediate: true
        }
    }
};
</script>
