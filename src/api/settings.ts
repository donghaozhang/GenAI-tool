/**
 * Settings API - 设置相关的API接口
 *
 * 该模块提供了与后端设置服务交互的所有API函数，包括：
 * - 设置文件存在性检查
 * - 获取和更新设置
 * - 代理配置管理
 * - 代理连接测试
 */

import { config } from '@/config/env'

// Use Supabase Edge Functions instead of relative paths
const API_BASE_URL = config.supabase.functionsUrl

/**
 * 检查设置文件是否存在
 *
 * @returns Promise<{ exists: boolean }> 返回设置文件是否存在的状态
 * @description 用于检查服务器端是否已经创建了设置文件，通常在应用初始化时调用
 * @example
 * const { exists } = await getSettingsExists();
 * if (!exists) {
 *   // 显示初始设置向导
 * }
 */
export async function getSettingsFileExists(): Promise<{ exists: boolean }> {
  const response = await fetch(`${API_BASE_URL}/jaaz-settings/api/settings/exists`)
  return await response.json()
}

/**
 * 获取所有设置配置
 *
 * @returns Promise<Record<string, unknown>> 返回包含所有设置的对象
 * @description 获取完整的设置配置，敏感信息（如密码）会被掩码处理
 * @note 返回的设置会与默认设置合并，确保所有必需的键都存在
 * @example
 * const settings = await getSettings();
 * const proxyConfig = settings.proxy;
 * const systemPrompt = settings.system_prompt;
 */
export async function getSettings(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/jaaz-settings/api/settings/system`)
  return await response.json()
}

/**
 * 更新设置配置
 *
 * @param settings - 要更新的设置对象，可以是部分设置
 * @returns Promise<{ status: string; message: string }> 返回操作结果
 * @description 更新指定的设置项，会与现有设置合并而不是完全替换
 * @example
 * const result = await updateSettings({
 *   proxy: 'http://proxy.example.com:8080',  // 或 '' 或 'system'
 *   system_prompt: 'You are a helpful assistant.'
 * });
 *
 * if (result.status === 'success') {
 *   console.log('Settings saved successfully');
 * }
 */
export async function updateSettings(
  settings: Record<string, unknown>
): Promise<{
  status: string
  message: string
}> {
  const response = await fetch(`${API_BASE_URL}/jaaz-settings/api/settings/system`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
  return await response.json()
}

/**
 * 获取代理设置
 *
 * @returns Promise<Record<string, unknown>> 返回代理配置对象
 * @description 仅获取代理相关的设置，不包含其他配置项
 * @example
 * const proxySettings = await getProxySettings();
 * console.log('Proxy setting:', proxySettings.proxy);
 * // 可能的值：
 * // '' - 不使用代理
 * // 'system' - 使用系统代理
 * // 'http://proxy.example.com:8080' - 使用指定代理
 */
export async function getProxySettings(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/jaaz-settings/api/settings/system/proxy`)
  return await response.json()
}

/**
 * 更新代理设置
 *
 * @param proxyConfig - 代理配置对象，包含proxy字段
 * @returns Promise<{ status: string; message: string }> 返回操作结果
 * @description 仅更新代理相关设置，不影响其他配置项
 * @example
 * // 不使用代理
 * const result1 = await updateProxySettings({ proxy: '' });
 *
 * // 使用系统代理
 * const result2 = await updateProxySettings({ proxy: 'system' });
 *
 * // 使用指定代理
 * const result3 = await updateProxySettings({
 *   proxy: 'http://proxy.example.com:8080'
 * });
 *
 * if (result.status === 'success') {
 *   console.log('Proxy settings updated');
 * }
 */
export async function updateProxySettings(
  proxyConfig: Record<string, unknown>
): Promise<{
  status: string
  message: string
}> {
  const response = await fetch(`${API_BASE_URL}/jaaz-settings/api/settings/system/proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proxyConfig),
  })
  return await response.json()
}
