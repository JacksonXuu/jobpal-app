<template>
  <DesktopLayout v-if="appStore.isDesktop" active="resume" @navigate="onSidebarNav">
    <view class="form-page form-desktop">
    <view class="form-back" @click="uni.navigateBack()">← 返回</view>
    <view class="form-section">
      <view class="form-group">
        <text class="form-label">简历标题 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.title"
          placeholder="请输入简历标题"
          maxlength="100"
        />
        <view class="form-divider" />
        <text class="form-label">简历描述</text>
        <textarea
          class="form-textarea-sm"
          v-model="form.description"
          placeholder="一句话描述这份简历..."
          maxlength="200"
        />
      </view>
    </view>

    <!-- Markdown 正文 -->
    <view class="form-section">
      <view class="section-header">
        <text class="section-label">简历正文 <text class="required">*</text></text>
        <text class="toggle-btn" @tap="previewMode = !previewMode">
          {{ previewMode ? '编辑' : '预览' }}
        </text>
      </view>
      <view class="form-group">
        <textarea
          v-if="!previewMode"
          class="form-textarea-md"
          v-model="form.content"
          placeholder="使用 Markdown 语法编写简历正文..."
          maxlength="10000"
        />
        <view v-else class="preview-box">
          <rich-text v-if="form.content" :nodes="previewHtml"></rich-text>
          <text v-else class="preview-empty">暂无内容</text>
        </view>
      </view>
      <text class="char-count">{{ form.content.length }}/10000</text>
    </view>

    <!-- 保存 -->
    <button class="submit-btn" :loading="submitting" @tap="handleSubmit">
      {{ isEdit ? '保存修改' : '创建简历' }}
    </button>
  </view>
  </DesktopLayout>

  <!-- 手机端 -->
  <view v-else class="form-page">
    <view class="form-section">
      <view class="form-group">
        <text class="form-label">简历标题 <text class="required">*</text></text>
        <input class="form-input" v-model="form.title" placeholder="请输入简历标题" maxlength="100" />
        <view class="form-divider" />
        <text class="form-label">简历描述</text>
        <textarea class="form-textarea-sm" v-model="form.description" placeholder="一句话描述这份简历..." maxlength="200" />
      </view>
      <view class="form-group">
        <view class="section-header">
          <text class="section-label">简历正文 <text class="required">*</text></text>
          <text class="toggle-btn" @tap="previewMode = !previewMode">
            {{ previewMode ? '编辑' : '预览' }}
          </text>
        </view>
        <textarea
          v-if="!previewMode"
          class="form-textarea"
          v-model="form.content"
          placeholder="使用 Markdown 语法编写简历正文..."
          maxlength="5000"
        />
        <view v-else class="preview-box preview-mobile">
          <rich-text v-if="form.content" :nodes="previewHtml"></rich-text>
          <text v-else class="preview-empty">暂无内容</text>
        </view>
        <text class="char-count">{{ form.content.length }}/5000</text>
      </view>
    </view>
    <button class="submit-btn" :loading="submitting" @tap="handleSubmit">{{ isEdit ? '保存修改' : '创建简历' }}</button>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAppStore } from '@/stores/app'
import DesktopLayout from '@/components/DesktopLayout.vue'

const appStore = useAppStore()

function onSidebarNav(page: string) {
  if (page === 'ask') { uni.switchTab({ url: '/pages/ask/index' }); return }
  if (page === 'home') { uni.switchTab({ url: '/pages/home' }); return }
}
import { marked } from 'marked'
import { createResume, updateResume, getResumeDetail, validateResumeForm } from '@/apis/resume'
import { useTracking } from '@/composables/useTracking'

const { trackAction } = useTracking({ module: 'resume' })

const isEdit = ref(false)
const previewMode = ref(false)

/** 预览 HTML */
const previewHtml = computed(() => {
  if (!form.content) return ''
  return marked.parse(form.content) as string
})
let editId: string | null = null

const form = reactive({
  title: '',
  description: '',
  content: '',
})
const submitting = ref(false)

onLoad((options?: Record<string, string>) => {
  if (options?.id) {
    isEdit.value = true
    editId = options.id
    uni.setNavigationBarTitle({ title: '编辑简历' })
    loadDetail(options.id)
  } else {
    uni.setNavigationBarTitle({ title: '新增简历' })
  }
})

async function loadDetail(id: string) {
  try {
    const r = await getResumeDetail(id)
    form.title = r.title
    form.description = r.description || ''
    form.content = r.content
  } catch { /* 拦截器已 toast */ }
}

async function handleSubmit() {
  const err = validateResumeForm({ title: form.title, content: form.content })
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const params = {
      title: form.title.trim(),
      content: form.content.trim(),
      description: form.description.trim() || undefined,
    }
    if (isEdit.value && editId) {
      trackAction('submit_edit')
      await updateResume(editId, params)
    } else {
      trackAction('submit_create')
      await createResume(params)
    }
    uni.showToast({ title: isEdit.value ? '修改成功' : '创建成功', icon: 'success', duration: 800 })
    uni.navigateBack()
  } catch { /* 拦截器已 toast */ }
  finally { submitting.value = false }
}
</script>

<style scoped>
.form-page {
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 80rpx;
}
.form-desktop {
  padding: 24rpx 32rpx;
  min-height: auto;
}
.form-back {
  font-size: 14px;
  color: var(--brand-primary);
  cursor: pointer;
  margin-bottom: 16rpx;
}

.form-section { margin-bottom: 24rpx; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}

.toggle-btn {
  font-size: 24rpx;
  color: var(--brand-primary);
  font-weight: 500;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  background: var(--brand-light);
}

.section-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}

.form-group {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
}

.form-divider {
  height: 1rpx;
  background: var(--divider);
  margin: 16rpx 0;
}
.form-label {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}
.required { color: #FF4757; }

.form-input {
  width: 100%;
  height: 72rpx;
  font-size: 30rpx;
  color: var(--text-primary);
  background: transparent;
  border-radius: 12rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.form-textarea-sm {
  width: 100%;
  height: 120rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  background: transparent;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-textarea {
  width: 100%;
  height: 500rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  background: transparent;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
  line-height: 1.7;
  font-family: 'Courier New', 'Consolas', monospace;
}

.form-textarea-md {
  width: 100%;
  height: 600rpx;
  font-size: 26rpx;
  color: var(--text-primary);
  background: transparent;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
  line-height: 1.7;
  font-family: 'Courier New', 'Consolas', monospace;
}

.preview-box {
  height: 600rpx;
  padding: 16rpx;
  line-height: 1.8;
  font-size: 28rpx;
  color: var(--text-primary);
  overflow-y: auto;
}
.preview-mobile { height: 500rpx; }
.preview-empty {
  font-size: 26rpx;
  color: var(--text-secondary);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: var(--text-secondary);
  margin-top: 8rpx;
  padding-right: 4rpx;
}
/* 预览富文本样式 */
.preview-box :deep(h1) { font-size: 40rpx; font-weight: 700; margin: 20rpx 0 14rpx; }
.preview-box :deep(h2) { font-size: 34rpx; font-weight: 600; margin: 16rpx 0 10rpx; }
.preview-box :deep(h3) { font-size: 30rpx; font-weight: 600; margin: 12rpx 0 8rpx; }
.preview-box :deep(p) { margin: 8rpx 0; }
.preview-box :deep(ul), .preview-box :deep(ol) { padding-left: 40rpx; margin: 8rpx 0; }
.preview-box :deep(li) { margin: 4rpx 0; }
.preview-box :deep(strong) { font-weight: 700; }
.preview-box :deep(em) { font-style: italic; }
.preview-box :deep(code) {
  background: var(--divider);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  font-family: 'Courier New', monospace;
  font-size: 26rpx;
}
.preview-box :deep(pre) {
  background: transparent;
  padding: 20rpx;
  border-radius: 12rpx;
  overflow-x: auto;
  margin: 12rpx 0;
}
.preview-box :deep(pre code) { background: none; padding: 0; }
.preview-box :deep(blockquote) {
  border-left: 6rpx solid var(--brand-primary);
  padding-left: 20rpx;
  color: #666;
  margin: 12rpx 0;
}
.preview-box :deep(hr) { border: none; border-top: 1rpx solid #E0E0E0; margin: 20rpx 0; }
.preview-box :deep(a) { color: var(--brand-primary); }

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: var(--brand-primary);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin-top: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(12,181,178,0.3);
}
.submit-btn::after { border: none; }
.submit-btn[loading] { opacity: 0.7; }
</style>
