<template>
  <component
    :is="tag"
    class="app-card"
    :class="cardClasses"
  >
    <div v-if="$slots.header || title" class="app-card__header">
      <slot name="header">
        <h2 class="app-card__title">{{ title }}</h2>
      </slot>
    </div>

    <div v-if="!noPadding" class="app-card__body">
      <slot />
    </div>
    <slot v-else />

    <div v-if="$slots.footer" class="app-card__footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default'
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      default: 'div'
    }
  },
  computed: {
    cardClasses() {
      return [
        `app-card--${this.variant}`,
        {
          'app-card--hoverable': this.hoverable,
          'app-card--active': this.active,
          'app-card--no-padding': this.noPadding
        }
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
.app-card {
  position: relative;
  background: var(--card-background);
  border: 1px solid var(--card-border-color, var(--border-color));
  border-radius: 12px;
  box-shadow: none;
  color: var(--text-color);
  transition: border-color 0.25s ease, background-color 0.25s ease, transform 0.25s ease;
}

.app-card--stats {
  border-radius: 16px;
}

.app-card--hoverable:hover,
.app-card--active {
  background: var(--card-hover-background, var(--card-background));
  border-color: var(--card-hover-border-color, var(--theme-color));
  box-shadow: none;
}

.app-card--hoverable:hover {
  transform: translateY(-2px);
}

.app-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.app-card__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.app-card__body {
  min-width: 0;
}

.app-card__footer {
  margin-top: 16px;
}
</style>
