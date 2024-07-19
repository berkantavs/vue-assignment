<template>
  <b-avatar v-b-tooltip.hover :title="agent.fields.agent_name + ' ' + agent.fields.agent_surname" button :style="{
    backgroundColor: agent.fields.color, transform: isSelected ? 'scale(0.9)' : 'scale(1)'
  }" class="agent-avatar-item" @click="toggleSelection">
    <span class="text-white">
      {{ agent.fields.agent_name.charAt(0) }}{{ agent.fields.agent_surname.charAt(0) }}
    </span>
  </b-avatar>
</template>

<script>
export default {
  props: ['agent'],
  data() {
    return {
      isSelected: false,
    }
  },
  methods: {
    toggleSelection() {
      this.isSelected = !this.isSelected;
      if (this.isSelected) {
        this.$emit('selectedAgent', this.agent);
      } else {
        this.$emit('deselectedAgent', this.agent);
      }
    }
  }
};
</script>

<style scoped>
.agent-avatar-item {
  transition: transform 0.2s;
}

.agent-avatar-item:active {
  transform: scale(0.9);
}
</style>
