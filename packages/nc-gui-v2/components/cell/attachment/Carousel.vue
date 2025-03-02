<script lang="ts" setup>
import { onKeyDown } from '@vueuse/core'
import { useAttachmentCell } from './utils'
import { isImage } from '~/utils'
import { computed, onClickOutside, ref, watch } from '#imports'
import MaterialSymbolsArrowCircleRightRounded from '~icons/material-symbols/arrow-circle-right-rounded'
import MaterialSymbolsArrowCircleLeftRounded from '~icons/material-symbols/arrow-circle-left-rounded'
import MdiCloseCircle from '~icons/mdi/close-circle'

const { selectedImage, visibleItems, downloadFile } = useAttachmentCell()!

const carouselRef = ref()

const imageItems = computed(() => visibleItems.value.filter((item) => isImage(item.title, item.mimetype)))

/** navigate to previous image on button click */
onKeyDown(
  (e) => ['Left', 'ArrowLeft', 'A'].includes(e.key),
  () => {
    if (carouselRef.value) carouselRef.value.prev()
  },
)

/** navigate to next image on button click */
onKeyDown(
  (e) => ['Right', 'ArrowRight', 'D'].includes(e.key),
  () => {
    if (carouselRef.value) carouselRef.value.next()
  },
)

/** set our selected image when slide changes */
function onSlideChange(index: number) {
  selectedImage.value = imageItems.value[index]
}

/** set our carousel ref and move to initial slide  */
const setCarouselRef = (el: Element) => {
  carouselRef.value = el

  carouselRef.value?.goTo(
    imageItems.value.findIndex((item) => item === selectedImage.value),
    true,
  )
}

/** close overlay view when clicking outside of image */
onClickOutside(carouselRef, () => {
  selectedImage.value = false
})
</script>

<template>
  <general-overlay v-model="selectedImage">
    <template v-if="selectedImage">
      <div class="overflow-hidden p-12 text-center relative">
        <div class="text-white group absolute top-5 right-5">
          <MdiCloseCircle class="group-hover:text-red-500 cursor-pointer text-4xl" @click.stop="selectedImage = false" />
        </div>

        <div
          class="select-none group hover:ring active:ring-pink-500 cursor-pointer leading-8 inline-block px-3 py-1 bg-gray-300 text-white mb-4 text-center rounded shadow"
          @click.stop="downloadFile(selectedImage)"
        >
          <h3 class="group-hover:text-primary">{{ selectedImage && selectedImage.title }}</h3>
        </div>

        <a-carousel
          v-if="!!selectedImage"
          :ref="setCarouselRef"
          dots-class="slick-dots slick-thumb"
          :after-change="onSlideChange"
          arrows
        >
          <template #prevArrow>
            <div class="custom-slick-arrow left-2 z-1">
              <MaterialSymbolsArrowCircleLeftRounded class="bg-white rounded-full" />
            </div>
          </template>

          <template #nextArrow>
            <div class="custom-slick-arrow !right-2 z-1">
              <MaterialSymbolsArrowCircleRightRounded class="bg-white rounded-full" />
            </div>
          </template>

          <template #customPaging="props">
            <a>
              <nuxt-img
                class="!block"
                :alt="imageItems[props.i].title || `#${props.i}`"
                :src="imageItems[props.i].url || imageItems[props.i].data"
              />
            </a>
          </template>

          <div v-for="item of imageItems" :key="item.url">
            <div
              :style="{ backgroundImage: `url('${item.url}')` }"
              class="min-w-70vw min-h-70vh w-full h-full bg-contain bg-center bg-no-repeat"
            />
          </div>
        </a-carousel>
      </div>
    </template>
  </general-overlay>
</template>

<style scoped>
.ant-carousel :deep(.slick-dots) {
  @apply relative mt-4;
}

.ant-carousel :deep(.slick-slide) {
  @apply w-full;
}

.ant-carousel :deep(.slick-slide img) {
  @apply border-1 m-auto;
}

.ant-carousel :deep(.slick-thumb) {
  @apply bottom-2;
}

.ant-carousel :deep(.slick-thumb li) {
  @apply w-[60px] h-[45px];
}

.ant-carousel :deep(.slick-thumb li img) {
  @apply w-full h-full block;
  filter: grayscale(100%);
}

.ant-carousel :deep .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}

.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  @apply text-4xl text-white hover:text-primary active:text-pink-500 opacity-100 cursor-pointer z-1;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.5;
}
</style>
