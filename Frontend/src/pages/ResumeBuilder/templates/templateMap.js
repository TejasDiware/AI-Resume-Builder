/**
 * Central template registry.
 * Import this wherever you need to resolve a templateId → component.
 */
import Template2Brian         from './Template2Brian'
import Template1DarkNavy      from './Template1DarkNavy'
import Template4Wendy         from './Template4Wendy'
import Template5Fresher       from './Template5Fresher'
import Template6ATS           from './Template6ATS'
import Template7SlateBlue     from './Template7SlateBlue'
import Template12CharcoalSidebar from './Template12CharcoalSidebar'
import Template15EnhancvPro from './Template15EnhancvPro'
import Template16RichardClean from './Template16RichardClean'
import Template17EnhancvTimeline from './Template17EnhancvTimeline'
import Template18BenjaminWallace from './Template18BenjaminWallace'
import Template19ResumeWorded from './Template19ResumeWorded'
import Template20EnhancvTwoCol from './Template20EnhancvTwoCol'
import Template21StevenBrandon from './Template21StevenBrandon'
import Template22EnhancvDarkSidebar from './Template22EnhancvDarkSidebar'
import Template23AikoYamamoto from './Template23AikoYamamoto'
import Template25JohnDoeAttorney from './Template25JohnDoeAttorney'
import Template26DanielaMurray from './Template26DanielaMurray'
import Template27RichardSanchez from './Template27RichardSanchez'

const templateMap = {
  1:  { name: 'Dark Navy Sidebar',   category: 'Professional', Component: Template1DarkNavy      },
  2:  { name: 'Brian Professional',   category: 'Professional', Component: Template2Brian        },
  4:  { name: 'Minimal ATS',          category: 'Minimal',      Component: Template4Wendy        },
  5:  { name: 'Fresher Classic',      category: 'Modern',       Component: Template5Fresher      },
  6:  { name: 'ATS Single Column',    category: 'Minimal',      Component: Template6ATS          },
  7:  { name: 'Slate Blue Sidebar',   category: 'Professional', Component: Template7SlateBlue    },
  12: { name: 'Charcoal Sidebar',     category: 'Professional', Component: Template12CharcoalSidebar },
  15: { name: 'Enhancv Professional', category: 'Professional', Component: Template15EnhancvPro  },
  16: { name: 'Richard Clean',        category: 'Minimal',      Component: Template16RichardClean },
  17: { name: 'Enhancv Timeline',     category: 'Modern',       Component: Template17EnhancvTimeline },
  18: { name: 'Benjamin Wallace',     category: 'Professional', Component: Template18BenjaminWallace },
  19: { name: 'Resume Worded',        category: 'Modern',       Component: Template19ResumeWorded },
  20: { name: 'Enhancv Two Column',   category: 'Modern',       Component: Template20EnhancvTwoCol },
  21: { name: 'Steven Brandon',       category: 'Professional', Component: Template21StevenBrandon },
  22: { name: 'Enhancv Dark Sidebar', category: 'Modern',       Component: Template22EnhancvDarkSidebar },
  23: { name: 'Aiko Yamamoto',        category: 'Modern',       Component: Template23AikoYamamoto },
  25: { name: 'Classic Attorney',     category: 'Professional', Component: Template25JohnDoeAttorney },
  26: { name: 'Daniela Murray',       category: 'Professional', Component: Template26DanielaMurray },
  27: { name: 'Richard Sanchez',      category: 'Professional', Component: Template27RichardSanchez },
}

export default templateMap
