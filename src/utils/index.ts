import { AadGroup, AadUser } from '../types'

export function getGroupTypeBadge(group: AadGroup) {
  if (group.groupTypes.includes('Unified')) {
    return { type: 'Microsoft 365', variant: 'secondary' as const }
  }
  return { type: 'Security', variant: 'outline' as const }
}

export function getGroupFeatures(group: AadGroup) {
  const features = []
  if (group.membershipRule) {
    features.push({ 
      type: 'Dynamic', 
      variant: 'secondary' as const,
      tooltip: `Rule: ${group.membershipRule}`
    })
  }
  return features
}

export function hasGuestUsers(users: AadUser[]) {
  return users.some(user => user.userPrincipalName.includes('#EXT#'))
}

export function getGuestUserCount(users: AadUser[]) {
  return users.filter(user => user.userPrincipalName.includes('#EXT#')).length
}

export function formatCapabilityName(capability: string) {
  return capability.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

export function generateId(prefix: string = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
