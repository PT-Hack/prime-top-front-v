<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePermissions } from '@/composables/usePermissions'
import { useToast } from '@/composables/useToast'
import { authApi } from '@/services/api/auth.api'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import ProfileForm from '@/components/user/ProfileForm.vue'
import ChangePasswordForm from '@/components/user/ChangePasswordForm.vue'

const router = useRouter()
const { currentUser, hasCompany } = useAuth()
const { canCreateCompany } = usePermissions()
const { showToast } = useToast()

const savingNotifications = ref(false)

const notificationSettings = ref({
  email: currentUser.value?.notificationSettings.email ?? true,
  push: currentUser.value?.notificationSettings.push ?? false,
  sms: currentUser.value?.notificationSettings.sms ?? false,
})

const handleCreateCompany = () => {
  router.push('/company/create')
}

const handleNotificationChange = async () => {
  if (!currentUser.value) return

  savingNotifications.value = true

  try {
    const updatedUser = await authApi.updateProfile(currentUser.value.id, {
      notificationSettings: {
        email: notificationSettings.value.email,
        push: notificationSettings.value.push,
        sms: notificationSettings.value.sms,
      },
    })

    // Обновляем currentUser
    if (currentUser.value) {
      Object.assign(currentUser.value, updatedUser)
    }

    showToast('Настройки уведомлений обновлены', 'success')
  } catch (error) {
    console.error('Ошибка обновления настроек:', error)
    showToast('Не удалось обновить настройки', 'error')
  } finally {
    savingNotifications.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-6">
      <!-- Заголовок страницы -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-text">Профиль</h1>
        <p class="text-gray-600 mt-1">Управление личными данными и настройками</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Левая колонка - Карточка пользователя -->
        <div class="lg:col-span-1">
          <AppCard>
            <div class="text-center">
              <!-- Аватар -->
              <div class="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-primary font-bold text-4xl">
                  {{ currentUser?.fullName.charAt(0).toUpperCase() }}
                </span>
              </div>

              <!-- Информация о пользователе -->
              <h2 class="text-xl font-bold text-text mb-1">{{ currentUser?.fullName }}</h2>
              <p class="text-sm text-gray-600 mb-4">{{ currentUser?.email }}</p>

              <!-- Роль -->
              <div class="inline-block px-3 py-1 bg-primary-100 text-primary text-sm font-medium rounded-full mb-4">
                {{ currentUser?.role }}
              </div>

              <!-- Кнопка создания компании -->
              <div v-if="canCreateCompany && !hasCompany" class="mt-6 pt-6 border-t border-gray-400">
                <p class="text-sm text-gray-600 mb-3">У вас ещё нет компании</p>
                <AppButton
                  variant="primary"
                  :full-width="true"
                  @click="handleCreateCompany"
                >
                  Создать компанию
                </AppButton>
              </div>

              <!-- Информация о компании -->
              <div v-else-if="hasCompany" class="mt-6 pt-6 border-t border-gray-400">
                <p class="text-sm text-gray-600 mb-2">Вы состоите в компании</p>
                <AppButton
                  variant="outline"
                  :full-width="true"
                  @click="router.push('/company')"
                >
                  Перейти к компании
                </AppButton>
              </div>
            </div>
          </AppCard>

          <!-- Настройки уведомлений -->
          <AppCard class="mt-6">
            <div>
              <h3 class="text-lg font-semibold text-text mb-4">Уведомления</h3>
              <div class="space-y-4">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-text">Email уведомления</span>
                  <input
                    v-model="notificationSettings.email"
                    type="checkbox"
                    class="w-5 h-5 text-primary rounded focus:ring-primary"
                    :disabled="savingNotifications"
                    @change="handleNotificationChange"
                  />
                </label>

                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-text">Push уведомления</span>
                  <input
                    v-model="notificationSettings.push"
                    type="checkbox"
                    class="w-5 h-5 text-primary rounded focus:ring-primary"
                    :disabled="savingNotifications"
                    @change="handleNotificationChange"
                  />
                </label>

                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-text">SMS уведомления</span>
                  <input
                    v-model="notificationSettings.sms"
                    type="checkbox"
                    class="w-5 h-5 text-primary rounded focus:ring-primary"
                    :disabled="savingNotifications"
                    @change="handleNotificationChange"
                  />
                </label>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Правая колонка - Формы редактирования -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Форма редактирования профиля -->
          <AppCard>
            <ProfileForm />
          </AppCard>

          <!-- Форма смены пароля -->
          <AppCard>
            <ChangePasswordForm />
          </AppCard>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
