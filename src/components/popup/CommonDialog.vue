<template>
  <AppDialog
    :open="showDialog"
    :title="title"
    :content="content"
    :show-close="showCloseIcon"
    :dismissable="clickOverlayToClose"
    size="md"
    backdrop="opaque"
    @close="handleClose"
  >
    <template #footer v-if="showCancelButton || showConfirmButton">
      <button
        v-if="showCancelButton"
        class="dialog-btn dialog-btn-cancel"
        type="button"
        @click="handleClose"
      >
        {{ cancelButtonText || $t(cancelButtonI18nKey) }}
      </button>

      <button
        v-if="showConfirmButton"
        class="dialog-btn dialog-btn-confirm"
        type="button"
        @click="handleConfirm"
      >
        {{ confirmButtonText || $t(confirmButtonI18nKey) }}
      </button>
    </template>
  </AppDialog>
</template>

<script>
import AppDialog from '@/components/common/AppDialog.vue';

export default {
  name: 'CommonDialog',
  components: {
    AppDialog
  },
  props: {
    showDialog: {
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
    showCloseIcon: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: true
    },
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    cancelButtonText: {
      type: String,
      default: ''
    },
    confirmButtonText: {
      type: String,
      default: ''
    },
    cancelButtonI18nKey: {
      type: String,
      default: 'common.cancel'
    },
    confirmButtonI18nKey: {
      type: String,
      default: 'common.confirm'
    },
    clickOverlayToClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const handleClose = () => {
      emit('close');
    };

    const handleConfirm = () => {
      emit('confirm');
    };

    return {
      handleClose,
      handleConfirm
    };
  }
};
</script>

<style lang="scss" scoped>
.dialog-btn {
  min-width: 88px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.dialog-btn:hover {
  transform: translateY(-1px);
}

.dialog-btn-cancel {
  color: var(--text-color);
  background-color: var(--card-hover-background, var(--card-background));
  border: 1px solid var(--card-border-color, var(--border-color));
}

.dialog-btn-cancel:hover {
  border-color: var(--card-hover-border-color, var(--theme-color));
}

.dialog-btn-confirm {
  color: #fff;
  background-color: var(--theme-color);
  border: 1px solid var(--theme-color);
}

.dialog-btn-confirm:hover {
  background-color: var(--theme-hover-color, var(--theme-color));
}

@media (max-width: 768px) {
  .dialog-btn {
    width: 100%;
  }
}
</style>
