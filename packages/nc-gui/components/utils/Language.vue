<template>
  <div>
    <v-menu top offset-y>
      <template #activator="{ on }">
        <v-icon size="20" class="ml-2 nc-menu-translate" v-on="on">
          mdi-translate
        </v-icon>
      </template>
      <v-list dense class="nc-language-list">
        <v-list-item-group v-model="language">
          <v-list-item
            v-for="lan in languages"
            :key="lan.value"
            dense
            :value="lan"
            color="primary"
            @click="changeLan(lan)"
          >
            <v-list-item-subtitle class="text-capitalize">
              {{ labels[lan] || lan }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'Language',
  data: () => ({
    labels: {
      en: 'English',
      ja: '日本語',
    }
  }),
  computed: {
    languages() {
      return ((this.$i18n && this.$i18n.availableLocales) || ['ja']).sort()
    },
    language: {
      get() {
        return this.$store.state.settings.language
      },
      set(val) {
        this.$store.commit('settings/MutLanguage', val)
        this.applyDirection()
      }
    }
  },
  mounted() {
    this.applyDirection()
  },
  methods: {
    applyDirection() {
      const targetDirection = this.isRtlLang() ? 'rtl' : 'ltr'
      const oppositeDirection = targetDirection == 'ltr' ? 'rtl' : 'ltr'
      document.body.classList.remove(oppositeDirection)
      document.body.classList.add(targetDirection)
      document.body.style.direction = targetDirection
    },
    isRtlLang() {
      return ['fa', 'ar'].includes(this.language)
    },
    changeLan(lan) {
      this.language = lan
      const count = 200
      const defaults = {
        origin: { y: 0.7 }
      }

      function fire(particleRatio, opts) {
        window.confetti(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
          })
        )
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55
      })
      fire(0.2, {
        spread: 60
      })
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      })
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      })
      fire(0.1, {
        spread: 120,
        startVelocity: 45
      })
      this.$e('c:navbar:lang', { lang: lan })
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .nc-language-list {
    max-height: 90vh;
    overflow: auto;
    .v-list-item {
      min-height: 30px !important;
    }
  }
}
</style>
