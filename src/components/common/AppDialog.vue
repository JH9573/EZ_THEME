<template>
  <transition name="app-dialog-fade">
    <div
      v-if="open"
      class="app-dialog__backdrop"
      :class="`app-dialog__backdrop--${backdrop}`"
      @click.self="handleBackdropClick"
    >
      <div
        class="app-dialog__container"
        :class="[
          `app-dialog__container--${placement}`,
          `app-dialog__container--${size}`,
          `app-dialog__container--scroll-${scroll}`
        ]"
      >
        <section
          class="app-dialog__dialog"
          :class="[
            `app-dialog__dialog--${size}`,
            `app-dialog__dialog--scroll-${scroll}`
          ]"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel || title"
          tabindex="-1"
          @click.stop
        >
          <button
            v-if="showClose"
            class="app-dialog__close-trigger"
            type="button"
            :aria-label="closeLabel"
            @click="close"
          >
            <IconX :size="20" />
          </button>

          <header v-if="$slots.header || title || $slots.icon" class="app-dialog__header">
            <div v-if="$slots.icon" class="app-dialog__icon">
              <slot name="icon" />
            </div>
            <slot name="header">
              <h2 class="app-dialog__heading" v-html="title"></h2>
            </slot>
          </header>

          <main class="app-dialog__body">
            <slot>
              <div v-if="content" v-html="content"></div>
            </slot>
          </main>

          <footer v-if="$slots.footer" class="app-dialog__footer">
            <slot name="footer" :close="close" />
          </footer>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import { onBeforeUnmount, watch } from 'vue';
import { IconX } from '@tabler/icons-vue';

export default {
  name: 'AppDialog',
  components: {
    IconX
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg', 'cover', 'full'].includes(value)
    },
    placement: {
      type: String,
      default: 'auto',
      validator: value => ['auto', 'top', 'center', 'bottom'].includes(value)
    },
    backdrop: {
      type: String,
      default: 'opaque',
      validator: value => ['opaque', 'blur', 'transparent'].includes(value)
    },
    scroll: {
      type: String,
      default: 'inside',
      validator: value => ['inside', 'outside'].includes(value)
    },
    dismissable: {
      type: Boolean,
      default: true
    },
    keyboardDismissDisabled: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    closeLabel: {
      type: String,
      default: 'Close'
    }
  },
  emits: ['update:open', 'close', 'open-change'],
  setup(props, { emit }) {
    const close = () => {
      emit('update:open', false);
      emit('open-change', false);
      emit('close');
    };

    const handleBackdropClick = () => {
      if (props.dismissable) {
        close();
      }
    };

    const handleKeydown = event => {
      if (event.key === 'Escape' && props.open && !props.keyboardDismissDisabled) {
        close();
      }
    };

    watch(
      () => props.open,
      value => {
        emit('open-change', value);
        document.body.style.overflow = value ? 'hidden' : '';
      },
      { immediate: true }
    );

    document.addEventListener('keydown', handleKeydown);

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    });

    return {
      close,
      handleBackdropClick
    };
  }
};
</script>

<style lang="scss" scoped>
.app-dialog__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.58);
}

.app-dialog__backdrop--blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.app-dialog__backdrop--transparent {
  background-color: transparent;
}

.app-dialog__container {
  display: flex;
  width: 100%;
  max-height: 100%;
}

.app-dialog__container--auto,
.app-dialog__container--center {
  align-items: center;
  justify-content: center;
}

.app-dialog__container--top {
  align-items: flex-start;
  justify-content: center;
  padding-top: 32px;
}

.app-dialog__container--bottom {
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16px;
}

.app-dialog__container--scroll-outside {
  overflow-y: auto;
}

.app-dialog__dialog {
  position: relative;
  width: 100%;
  max-height: min(86vh, 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--card-background);
  border: 1px solid var(--card-border-color, var(--border-color));
  border-radius: 16px;
  color: var(--text-color);
  box-shadow: none;
  animation: app-dialog-in 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-dialog__dialog--xs {
  max-width: 320px;
}

.app-dialog__dialog--sm {
  max-width: 400px;
}

.app-dialog__dialog--md {
  max-width: 520px;
}

.app-dialog__dialog--lg {
  max-width: 760px;
}

.app-dialog__dialog--cover {
  max-width: calc(100vw - 80px);
  max-height: calc(100vh - 80px);
}

.app-dialog__dialog--full {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border-radius: 0;
  border: none;
}

.app-dialog__dialog--scroll-outside {
  max-height: none;
}

.app-dialog__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--card-border-color, var(--border-color));
  background: var(--card-hover-background, var(--card-background));
}

.app-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: var(--theme-color);
  background-color: rgba(var(--theme-color-rgb), 0.1);
  flex: 0 0 auto;
}

.app-dialog__heading {
  margin: 0;
  padding-right: 32px;
  font-size: 18px;
  line-height: 1.35;
  font-weight: 600;
}

.app-dialog__body {
  flex: 1;
  min-height: 0;
  padding: 22px 24px;
  overflow-y: auto;
  line-height: 1.6;
}

.app-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--card-border-color, var(--border-color));
}

.app-dialog__close-trigger {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--secondary-text-color);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.app-dialog__close-trigger:hover {
  color: var(--text-color);
  background-color: var(--card-hover-background, rgba(var(--theme-color-rgb), 0.08));
  border-color: var(--card-border-color, var(--border-color));
}

.app-dialog-fade-enter-active,
.app-dialog-fade-leave-active {
  transition: opacity 0.22s ease;
}

.app-dialog-fade-enter-from,
.app-dialog-fade-leave-to {
  opacity: 0;
}

@keyframes app-dialog-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .app-dialog__backdrop {
    padding: 12px;
  }

  .app-dialog__dialog {
    max-width: 100%;
    max-height: 88vh;
  }

  .app-dialog__dialog--cover {
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }

  .app-dialog__header,
  .app-dialog__body,
  .app-dialog__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .app-dialog__footer {
    flex-direction: column-reverse;
  }
}
</style>
