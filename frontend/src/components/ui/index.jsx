/**
 * Studyfy UI Components
 * Komponen-komponen UI yang reusable dengan styling konsisten
 */

import theme from '../../styles/theme'

// ========================================
// BUTTON COMPONENT
// ========================================
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  onClick,
  style = {},
  ...props 
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.semibold,
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${theme.transitions.fast}`,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  }

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
    },
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
    },
    secondary: {
      backgroundColor: theme.colors.background.elevated,
      color: theme.colors.text.primary,
      border: `1px solid ${theme.colors.border.main}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
    },
    danger: {
      backgroundColor: theme.colors.danger.main,
      color: theme.colors.danger.contrast,
    },
    success: {
      backgroundColor: theme.colors.success.main,
      color: theme.colors.success.contrast,
    },
  }

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

// ========================================
// CARD COMPONENT
// ========================================
export const Card = ({ 
  children, 
  padding = 'md',
  hoverable = false,
  onClick,
  style = {},
  ...props 
}) => {
  const paddingStyles = {
    none: '0',
    sm: theme.spacing[3],
    md: theme.spacing[5],
    lg: theme.spacing[6],
  }

  const cardStyle = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    padding: paddingStyles[padding],
    boxShadow: theme.shadows.sm,
    border: `1px solid ${theme.colors.border.light}`,
    cursor: onClick || hoverable ? 'pointer' : 'default',
    transition: `all ${theme.transitions.normal}`,
  }

  return (
    <div style={{ ...cardStyle, ...style }} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

// ========================================
// INPUT COMPONENT
// ========================================
export const Input = ({ 
  label, 
  error, 
  fullWidth = false,
  style = {},
  inputStyle = {},
  ...props 
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }

  const labelStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  }

  const inputBaseStyle = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    border: `2px solid ${error ? theme.colors.danger.main : theme.colors.border.main}`,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    outline: 'none',
    transition: `border-color ${theme.transitions.fast}`,
    width: '100%',
    boxSizing: 'border-box',
    ...inputStyle,
  }

  const errorStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.danger.main,
  }

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={inputBaseStyle} {...props} />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  )
}

// ========================================
// TEXTAREA COMPONENT
// ========================================
export const Textarea = ({ 
  label, 
  error, 
  fullWidth = false,
  rows = 4,
  style = {},
  textareaStyle = {},
  ...props 
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }

  const labelStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  }

  const textareaBaseStyle = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    border: `2px solid ${error ? theme.colors.danger.main : theme.colors.border.main}`,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    outline: 'none',
    resize: 'vertical',
    transition: `border-color ${theme.transitions.fast}`,
    width: '100%',
    boxSizing: 'border-box',
    ...textareaStyle,
  }

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea style={textareaBaseStyle} rows={rows} {...props} />
      {error && <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.danger.main }}>{error}</span>}
    </div>
  )
}

// ========================================
// BADGE COMPONENT
// ========================================
export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  style = {},
  ...props 
}) => {
  const sizeStyles = {
    sm: {
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.background.elevated,
      color: theme.colors.text.secondary,
    },
    primary: {
      backgroundColor: `${theme.colors.primary.main}15`,
      color: theme.colors.primary.main,
    },
    success: {
      backgroundColor: theme.colors.success.light,
      color: theme.colors.success.dark,
    },
    warning: {
      backgroundColor: theme.colors.warning.light,
      color: theme.colors.warning.dark,
    },
    danger: {
      backgroundColor: theme.colors.danger.light,
      color: theme.colors.danger.dark,
    },
    info: {
      backgroundColor: theme.colors.info.light,
      color: theme.colors.info.dark,
    },
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    fontWeight: theme.typography.fontWeight.medium,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  }

  return <span style={badgeStyle} {...props}>{children}</span>
}

// ========================================
// AVATAR COMPONENT
// ========================================
export const Avatar = ({ 
  name = '', 
  src,
  size = 'md',
  style = {},
  ...props 
}) => {
  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: theme.typography.fontSize.sm },
    md: { width: '40px', height: '40px', fontSize: theme.typography.fontSize.base },
    lg: { width: '48px', height: '48px', fontSize: theme.typography.fontSize.lg },
    xl: { width: '64px', height: '64px', fontSize: theme.typography.fontSize.xl },
  }

  const avatarStyle = {
    ...sizeStyles[size],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    color: theme.colors.primary.dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    overflow: 'hidden',
    ...style,
  }

  if (src) {
    return (
      <div style={avatarStyle} {...props}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return (
    <div style={avatarStyle} {...props}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ========================================
// EMPTY STATE COMPONENT
// ========================================
export const EmptyState = ({ 
  icon,
  title, 
  description, 
  action,
  style = {},
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[12],
    textAlign: 'center',
    ...style,
  }

  const iconStyle = {
    marginBottom: theme.spacing[4],
    color: theme.colors.text.disabled,
  }

  const titleStyle = {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  }

  const descStyle = {
    margin: 0,
    marginBottom: action ? theme.spacing[6] : 0,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    maxWidth: '320px',
  }

  return (
    <div style={containerStyle}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <h3 style={titleStyle}>{title}</h3>
      <p style={descStyle}>{description}</p>
      {action}
    </div>
  )
}

// ========================================
// STAT CARD COMPONENT
// ========================================
export const StatCard = ({ 
  icon,
  label, 
  value, 
  trend,
  trendDirection,
  style = {},
}) => {
  const cardStyle = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[5],
    border: `1px solid ${theme.colors.border.light}`,
    ...style,
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  }

  const iconWrapperStyle = {
    width: '44px',
    height: '44px',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary.main}10`,
    color: theme.colors.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const valueStyle = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
    lineHeight: 1,
  }

  const labelStyle = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  }

  const trendStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: trendDirection === 'up' ? theme.colors.success.main : theme.colors.danger.main,
    backgroundColor: trendDirection === 'up' ? theme.colors.success.light : theme.colors.danger.light,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.full,
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {icon && <div style={iconWrapperStyle}>{icon}</div>}
        {trend && (
          <span style={trendStyle}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p style={valueStyle}>{value}</p>
      <p style={labelStyle}>{label}</p>
    </div>
  )
}

// ========================================
// SUBJECT CARD COMPONENT (untuk mata pelajaran)
// ========================================
export const SubjectCard = ({ 
  title, 
  description, 
  icon,
  stats,
  onClick,
  style = {},
}) => {
  const cardStyle = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.border.light}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: `all ${theme.transitions.normal}`,
    ...style,
  }

  const headerStyle = {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing[5],
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
  }

  const iconWrapperStyle = {
    width: '48px',
    height: '48px',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.primary.contrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.xl,
  }

  const titleStyle = {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.contrast,
  }

  const bodyStyle = {
    padding: theme.spacing[5],
  }

  const descStyle = {
    margin: 0,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  }

  const statsStyle = {
    display: 'flex',
    gap: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
  }

  const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
  }

  const statValueStyle = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  }

  const statLabelStyle = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  }

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={headerStyle}>
        {icon && <div style={iconWrapperStyle}>{icon}</div>}
        <h3 style={titleStyle}>{title}</h3>
      </div>
      <div style={bodyStyle}>
        {description && <p style={descStyle}>{description}</p>}
        {stats && stats.length > 0 && (
          <div style={statsStyle}>
            {stats.map((stat, index) => (
              <div key={index} style={statItemStyle}>
                <span style={statValueStyle}>{stat.value}</span>
                <span style={statLabelStyle}>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
