import type { Permission } from './rolePermissions'
import rolePermissions from './rolePermissions'
import { useState } from '#app'
import { USER_PROJECT_ROLES } from '~/lib/constants'

export function useUIPermission() {
  const { $state } = useNuxtApp()
  const projectRoles = useState<Record<string, boolean>>(USER_PROJECT_ROLES, () => ({}))

  const isUIAllowed = (permission: Permission, _skipPreviewAs = false) => {
    const user = $state.user
    let userRoles = user?.value?.roles || {}
    // if string populate key-value paired object
    if (typeof userRoles === 'string') {
      userRoles = userRoles.split(',').reduce<Record<string, boolean>>((acc, role) => {
        acc[role] = true
        return acc
      }, {})
    }

    // merge user role and project specific user roles
    const roles = {
      ...userRoles,
      ...(projectRoles?.value || {}),
    }

    // todo: handle preview as
    // if (state.previewAs && !skipPreviewAs) {
    //   roles = {
    //     [state.previewAs]: true
    //   };
    // }

    return Object.entries<boolean>(roles).some(([role, hasRole]) => {
      const rolePermission = rolePermissions[role as keyof typeof rolePermissions] as '*' | Record<Permission, true>

      return hasRole && (rolePermission === '*' || rolePermission?.[permission])
    })
  }

  return { isUIAllowed }
}
