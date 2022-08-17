<template>
  <v-row class="welcome-page nc-welcome-page" style="min-height: 100vh" align="center" justify="center">
    <template v-if="(typed && moved) || ($store.state.project.appInfo && $store.state.project.appInfo.ncMin)">
      <v-col cols="12" sm="12" md="12" class="text-center">
        <h1 class="mt-8 mb-4 primary--text mt-1 white--tex mb-0 text-h2 font-weight-black">
          NinjaKoalaSan
        </h1>
        <template v-if="!loading">
          <p class="grey--text text--darken-1 title normal" v-html="message" />
        </template>

        <v-btn
          x-large
          class="primary mt-7 px-10 py-8 font-weight-black title let-us-begin"
          :loading="loading"
          @click="navigate"
        >
          <img src="~/assets/img/icons/512x512-trans.png" width="30" class="mr-4" />
          {{ loading ? 'Loading' : "Let's Begin" }}
        </v-btn>
      </v-col>
      <v-col cols="12">
        <p class="xc--text text--lighten-3 mt-15 mb-3 text-center">Supported Databases</p>
        <div class="d-flex logos justify-center">
          <img src="db/mysql.png.jpg" />
          <img src="db/mssql.png.jpg" />
          <img src="db/postgre.png.jpg" />
          <img src="db/maria.png.jpg" />
          <img src="db/aurora.png" />
          <img src="db/sqlite.svg" />
        </div>
      </v-col>
    </template>
    <div v-else>
      <p class="display-4 text-center font-weight-bold textColor--text text--lighten-1 welcome-msg">
        <vue-typer
          :repeat="0"
          text="Every once in a while,
a revolutionary tech comes
 along that changes everything."
          @typed="
            typed = true;
            moved = false;
          "
        />
      </p>

      <v-carousel v-show="typed" class="mt-14" hide-delimiters height="50" :show-arrows="false" cycle interval="1500">
        <v-carousel-item v-for="(item, i) in carItems" :key="i">
          <div class="text-center title font-italic font-bold primary--text">- {{ item.text }}</div>
        </v-carousel-item>
      </v-carousel>
    </div>
  </v-row>
</template>

<script>
// ES6
import { VueTyper } from 'vue-typer';

// import('animate.css/animate.min.css')

export default {
  name: 'Start',
  components: {
    VueTyper,
  },
  layout: 'empty',
  data: () => ({
    carItems: [{ text: "It's phenomenal !" }, { text: 'It is Open Source !' }, { text: 'And it works like magic !' }],
    showAnimText: 0,
    moved: false,
    typed: false,
    xc_ee: process.env.EE,
    defaultMessage: "Looks like you configured databases.<br> Now it's time to setup an admin user.",
    loading: true,

    /* Converted from : https://smodin.me/translate-one-text-into-multiple-languages
     * Enter database host name || Choose SQL Database type || Enter database username || Enter database password || Enter database port number || Enter database/schema name || Enter API type to generate || How do you want to run it
     * */
    lang: [
      {
        language: 'English',
        symbol: 'en',
        text: 'Enter database host name || Choose SQL Database type || Enter database username || Enter database password || Enter database port number || Enter database/schema name || Enter API type to generate || How do you want to run it',
      },
      {
        language: 'Japanese',
        symbol: 'ja',
        text: 'データベースのホスト名を入力してください|| SQLデータベースタイプを選択||データベースのユーザー名を入力してください||データベースのパスワードを入力してください||データベースのポート番号を入力してください||データベース/スキーマ名を入力してください||生成するAPIタイプを入力してください||どのように実行しますか',
      },
    ],
  }),
  computed: {
    text() {
      const text = this.lang.find(it => it.symbol === this.$store.state.settings.language);
      return text ? text.text : 'default';
    },
    appInfo() {
      return this.$store.state.project.appInfo;
    },
    message() {
      let message = this.defaultMessage;

      if (this.appInfo) {
        switch (this.appInfo.authType) {
          case 'jwt':
            /* if (this.appInfo.projectHasDb) { */
            message = 'Turns any database into an Airtable like collaborative spreadsheet. <br/>'; // 'The Open Source Airtable alternative. <br/>' +
            // +
            // 'Supports MySQL, PostgreSQL, MSSQL, SQLIte & MariaDB.';
            /*    } else {
                  message = 'Instantly generate REST APIs / GraphQL APIs / gRPC<br/> by connecting to any SQL database.'
                } */
            break;
          /*          case 'masterKey':
                      if (this.appInfo.projectHasDb) {
                        message = 'Looks like you configured databases. <br> Now it\'s time to authenticate via Master Key.';
                      } else {
                        message = 'Instantly generate REST APIs / GraphQL APIs / gRPC<br/> by connecting to any SQL database.'
                      }
                      break;
                    case 'none':
                      if (this.appInfo.projectHasDb) {
                        message = 'Looks like you configured databases. <br> No authentication configured access dashboard.';
                      } else {
                        message = 'Instantly generate REST APIs / GraphQL APIs / gRPC<br/> by connecting to any SQL database.'
                      }
                      break; */
          default:
            break;
        }
      }

      return message; // `${message} <br><span class="caption">(Current Environment : ${this.appInfo ? this.appInfo.env : ''})</span>`;
    },
  },
  created() {
    const appInfo = this.$store.state.project.appInfo;
    if (appInfo) {
      if (this.$store.state.users.token || (appInfo && appInfo.authType === 'none')) {
        this.$router.replace('/projects');
        return;
      } else if (appInfo && appInfo.projectHasAdmin) {
        this.$router.replace('/user/authentication/signin');
        return;
      }
    }
    this.loading = false;
  },
  mounted() {
    const handler = () => {
      this.moved = true;
      if (this.typed && !/\bcode=/.test(window.location.search)) {
        document.removeEventListener('mousemove', handler);
        this.simpleAnim();
        // const int = setInterval(() => {
        //   if (++this.showAnimText === 3) clearInterval(int)
        // },2000) f
      }
    };
    document.addEventListener('mousemove', handler);
  },
  methods: {
    simpleAnim() {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
      };

      function fire(particleRatio, opts) {
        window.confetti(
          Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
          })
        );
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    },

    navigate() {
      if (this.appInfo) {
        // if (!this.appInfo.projectHasDb) {
        //   this.$router.push('/project/0')
        // } else
        if (this.appInfo.projectHasAdmin === false) {
          return this.$router.push('/user/authentication/signup');
        }
      }
      this.$router.push('/projects');
    },
  },
};
</script>

<style scoped>
/deep/ .gh-button-container a {
  color: var(--v-grey-darken-1);
}

.text-h2 {
  line-height: 5rem;
}

.logos img {
  height: 40px;
  margin: 0 20px;
  /*filter: grayscale(1);*/
}

@keyframes wave {
  0% {
    margin-top: 0;
  }
  50% {
    margin-top: -20px;
  }
  100% {
    margin-top: 0px;
  }
}

.logos {
  min-height: 60px;
  padding-top: 20px;
}

.logos img {
  animation: wave 3s infinite;
}

.logos img:nth-child(2) {
  animation-delay: 0.3s;
}

.logos img:nth-child(3) {
  animation-delay: 0.6s;
}

.logos img:nth-child(4) {
  animation-delay: 0.9s;
}

.logos img:nth-child(5) {
  animation-delay: 1.2s;
}

.logos img:nth-child(6) {
  animation-delay: 1.5s;
}

/deep/ .typed {
  color: var(--v-textColor--lighten-1);
}

.welcome-msg {
  line-height: 7rem;
}
</style>
<!--
/**
 * @copyright Copyright (c) 2021, Xgene Cloud Ltd
 *
 * @author Naveen MR <oof1lab@gmail.com>
 * @author Pranav C Balan <pranavxc@gmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
-->
