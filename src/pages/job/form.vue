<template>
  <view class="form-page">
    <!-- 必填项 -->
    <view class="form-section">
      <text class="section-label">必填项</text>
      <view class="form-group">
        <text class="form-label">岗位名称 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.jobName"
          placeholder="请输入岗位名称"
          maxlength="100"
        />
      </view>
      <view class="form-group">
        <text class="form-label">公司名称 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.companyName"
          placeholder="请输入公司名称"
          maxlength="100"
        />
      </view>
      <view class="form-group">
        <text class="form-label">薪资 (K) <text class="required">*</text></text>
        <input
          class="form-input"
          v-model.number="form.salary"
          type="digit"
          placeholder="请输入薪资，单位 k"
        />
      </view>
    </view>

    <!-- 可选项 -->
    <view class="form-section">
      <text class="section-label">可选项</text>
      <view class="form-group">
        <text class="form-label">心动等级</text>
        <view class="rating-row">
          <UniRate v-model="form.rating" :max="5" :size="28" />
        </view>
      </view>
      <view class="form-group" @tap="openPicker('sourcePlatform')">
        <text class="form-label">来源平台</text>
        <view class="form-picker">
          <text :class="{ placeholder: !form.sourcePlatform }">
            {{ form.sourcePlatform || '请选择来源平台' }}
          </text>
          <text class="picker-arrow">›</text>
        </view>
      </view>
      <view class="form-group" @tap="openPicker('status')">
        <text class="form-label">状态</text>
        <view class="form-picker">
          <text :class="{ placeholder: !form.status }">
            {{ form.status || '请选择状态' }}
          </text>
          <text class="picker-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 长文本 -->
    <view class="form-section">
      <text class="section-label">详细信息</text>
      <view class="form-group">
        <text class="form-label">岗位要求</text>
        <textarea
          class="form-textarea"
          v-model="form.requirements"
          placeholder="请输入岗位要求..."
          maxlength="2000"
        />
      </view>
      <view class="form-group">
        <text class="form-label">岗位职责</text>
        <textarea
          class="form-textarea"
          v-model="form.responsibilities"
          placeholder="请输入岗位职责..."
          maxlength="2000"
        />
      </view>
      <view class="form-group">
        <text class="form-label">心动原因</text>
        <textarea
          class="form-textarea"
          v-model="form.attractiveness"
          placeholder="请输入心动原因..."
          maxlength="2000"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <button class="submit-btn" :loading="submitting" @tap="handleSubmit">
      {{ isEdit ? '保存修改' : '创建岗位' }}
    </button>

    <!-- Picker 选择器 -->
    <view v-if="pickerVisible" class="picker-overlay" @tap="closePicker">
      <view class="picker-sheet" @tap.stop="">
        <view class="picker-header">
          <text class="picker-cancel" @tap="closePicker">取消</text>
          <text class="picker-title">{{ pickerTitle }}</text>
          <text class="picker-confirm" @tap="confirmPicker">确定</text>
        </view>
        <view class="picker-body">
          <view
            v-for="opt in pickerOptions"
            :key="opt.value"
            class="picker-option"
            :class="{ selected: pickerTemp === opt.value }"
            @tap="pickerTemp = opt.value"
          >
            <text>{{ opt.label }}</text>
            <text v-if="pickerTemp === opt.value" class="check">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import UniRate from '@dcloudio/uni-ui/lib/uni-rate/uni-rate.vue'
import {
  createJob,
  updateJob,
  getJobDetail,
  validateJobForm,
  JOB_STATUS_OPTIONS,
  SOURCE_PLATFORM_OPTIONS,
} from '@/apis/job'

// ── 模式判断 ──
const isEdit = ref(false)
let editId: string | null = null

// ── 表单 ──
const form = reactive({
  jobName: '',
  companyName: '',
  salary: '' as string | number,
  requirements: '',
  responsibilities: '',
  attractiveness: '',
  rating: 3,
  sourcePlatform: '招聘平台',
  status: '待投递',
})

const submitting = ref(false)

onLoad((options?: Record<string, string>) => {
  if (options?.id) {
    isEdit.value = true
    editId = options.id
    uni.setNavigationBarTitle({ title: '编辑岗位' })
    loadDetail(options.id)
  } else {
    uni.setNavigationBarTitle({ title: '新增岗位' })
  }
})

/** 编辑模式：回填数据 */
async function loadDetail(id: string) {
  try {
    const job = await getJobDetail(id)
    form.jobName = job.jobName
    form.companyName = job.companyName
    form.salary = job.salary
    form.requirements = job.requirements || ''
    form.responsibilities = job.responsibilities || ''
    form.attractiveness = job.attractiveness || ''
    form.rating = job.rating
    form.sourcePlatform = job.sourcePlatform
    form.status = job.status
  } catch {
    // 拦截器已 toast
  }
}

// ── Picker 弹层 ──
type PickerField = 'sourcePlatform' | 'status'
const pickerVisible = ref(false)
const pickerField = ref<PickerField>('sourcePlatform')
const pickerTemp = ref('')

const pickerTitle = computed(() => {
  return pickerField.value === 'sourcePlatform' ? '选择来源平台' : '选择状态'
})

const pickerOptions = computed(() => {
  const list = pickerField.value === 'sourcePlatform'
    ? SOURCE_PLATFORM_OPTIONS
    : JOB_STATUS_OPTIONS
  return list.map((s) => ({ label: s, value: s }))
})

function openPicker(field: PickerField) {
  pickerField.value = field
  pickerTemp.value = form[field] || ''
  pickerVisible.value = true
}

function closePicker() {
  pickerVisible.value = false
}

function confirmPicker() {
  form[pickerField.value] = pickerTemp.value
  pickerVisible.value = false
}

// ── 提交 ──
async function handleSubmit() {
  const err = validateJobForm({
    jobName: form.jobName,
    companyName: form.companyName,
    salary: form.salary,
  })
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const params = {
      jobName: form.jobName.trim(),
      companyName: form.companyName.trim(),
      salary: Number(form.salary),
      requirements: form.requirements || undefined,
      responsibilities: form.responsibilities || undefined,
      attractiveness: form.attractiveness || undefined,
      rating: form.rating,
      sourcePlatform: form.sourcePlatform,
      status: form.status,
    }

    if (isEdit.value && editId) {
      await updateJob(editId, params)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      await createJob(params)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch {
    // 拦截器已 toast
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-page {
  background: transparent;
  min-height: 100vh;
  padding: 24rpx 24rpx 160rpx;
}

/* ── 分区 ── */
.form-section {
  margin-bottom: 24rpx;
}
.section-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  padding-left: 4rpx;
}

/* ── 表单组 ── */
.form-group {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
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
.form-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: var(--text-primary);
  background: transparent;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
  line-height: 1.6;
}
.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72rpx;
  background: transparent;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  color: var(--text-primary);
}
.form-picker .placeholder { color: var(--text-secondary); }
.picker-arrow {
  font-size: 36rpx;
  color: var(--text-secondary);
}

/* ── 星级 ── */
.rating-row {
  padding: 8rpx 0;
}

/* ── 提交按钮 ── */
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
  box-shadow: var(--brand-shadow);
}
.submit-btn::after { border: none; }
.submit-btn[loading] { opacity: 0.7; }

/* ── Picker 弹层 ── */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.picker-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}
.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--divider);
}
.picker-cancel { font-size: 28rpx; color: var(--text-secondary); }
.picker-title { font-size: 30rpx; font-weight: 600; color: var(--text-primary); }
.picker-confirm { font-size: 28rpx; color: var(--brand-primary); font-weight: 600; }
.picker-body { overflow-y: auto; padding: 16rpx 0; }
.picker-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 40rpx;
  font-size: 28rpx;
  color: var(--text-primary);
}
.picker-option.selected { color: var(--brand-primary); font-weight: 600; }
.check { font-size: 32rpx; }
</style>
