"use client";

import Reveal from "./Reveal";
import { CHAINS_SEAM, MODES_SEAM } from "./seams";

/* ────────────────────────────────────────────────────────────
   MULTICHAIN — one cloud, every chain hooked onto it.
   The hero rings the mark with chains on a circle; this doesn't
   repeat that. Here the badges are pinned around the silhouette
   of a single big cumulus — perched along its top bumps, hanging
   off its underside — so they read as attached to the cloud
   rather than orbiting it. The heading sits inside the cloud.
   ──────────────────────────────────────────────────────────── */

interface ChainItem {
  name: string;
  icon: React.ReactNode;
}

// Real, official chain logos in single-colour (mono) form. They use
// fill="currentColor" so they take the violet ink of the theme rather
// than their own brand colours.
const CHAINS: ChainItem[] = [
  {
    name: "Monad",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M12 3c-2.599 0-9 6.4-9 9s6.401 9 9 9 9-6.401 9-9-6.401-9-9-9m-1.402 14.146c-1.097-.298-4.043-5.453-3.744-6.549s5.453-4.042 6.549-3.743c1.095.298 4.042 5.453 3.743 6.549-.298 1.095-5.453 4.042-6.549 3.743" />
      </svg>
    ),
  },
  {
    name: "Ethereum",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M12 3v6.652l5.625 2.516zm0 0-5.625 9.166L12 9.652zm0 13.478V21l5.625-7.785zM12 21v-4.522l-5.625-3.263z" />
        <path d="m12 15.43 5.625-3.263L12 9.652zm-5.625-3.263L12 15.43V9.652z" />
        <path fillRule="evenodd" d="m12 15.43-5.625-3.262L12 3l5.625 9.166zm-5.25-3.528 5.162-8.41v6.115zm-.077.229 5.239-2.327v5.364zm5.418-2.327v5.364l5.233-3.037zm0-.197 5.162 2.295-5.162-8.41z" clipRule="evenodd" />
        <path fillRule="evenodd" d="m12 16.407-5.625-3.195L12 21l5.625-7.789zm-4.995-2.633 4.906 2.79v4.005zm5.085 2.79v4.005l4.904-6.795z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Base",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M3 4.706c0-.585 0-.877.11-1.101.106-.215.28-.39.496-.495C3.83 3 4.122 3 4.706 3h14.588c.585 0 .876 0 1.101.11.215.105.389.28.494.495.111.225.111.517.111 1.101v14.588c0 .585 0 .876-.11 1.101-.106.215-.28.389-.495.494-.225.111-.517.111-1.101.111H4.706c-.585 0-.876 0-1.101-.11a1.08 1.08 0 0 1-.494-.495C3 20.17 3 19.878 3 19.294z" />
      </svg>
    ),
  },
  {
    name: "Arbitrum",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="m13.353 13.368-.885 2.39a.3.3 0 0 0 0 .205l1.523 4.112 1.76-1.001-2.113-5.706a.152.152 0 0 0-.285 0m1.774-4.019a.152.152 0 0 0-.285 0l-.885 2.39a.3.3 0 0 0 0 .205l2.494 6.732 1.761-1.001z" />
        <path d="M11.998 4.115a.3.3 0 0 1 .126.033l6.715 3.818a.25.25 0 0 1 .126.214v7.635c0 .089-.048.17-.126.214l-6.715 3.819a.25.25 0 0 1-.126.032.3.3 0 0 1-.125-.032l-6.715-3.815a.25.25 0 0 1-.126-.215V8.182c0-.089.048-.17.126-.215l6.715-3.818a.26.26 0 0 1 .125-.034m0-1.115c-.238 0-.478.06-.692.183L4.593 7A1.36 1.36 0 0 0 3.9 8.182v7.635c0 .487.264.938.693 1.181l6.714 3.819a1.41 1.41 0 0 0 1.386 0l6.714-3.818a1.36 1.36 0 0 0 .693-1.182V8.182A1.36 1.36 0 0 0 19.407 7l-6.716-3.817A1.4 1.4 0 0 0 11.998 3" />
        <path d="m7.559 18.685.617-1.666 1.244 1.018-1.163 1.046zm3.874-11.05H9.731a.3.3 0 0 0-.285.197l-3.649 9.852 1.761 1.001 4.018-10.849a.15.15 0 0 0-.143-.2" />
        <path d="M14.412 7.635h-1.703a.3.3 0 0 0-.284.197l-4.167 11.25 1.761 1 4.535-12.246a.15.15 0 0 0-.142-.2" />
      </svg>
    ),
  },
  {
    name: "BNB Chain",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M7.09 5.755 12 3l4.91 2.755-1.8 1.02L12 5.035l-3.105 1.74zm9.82 3.48-1.8-1.02L12 9.955l-3.105-1.74-1.805 1.02v2.035l3.1 1.74v3.475l1.81 1.02 1.805-1.02V13.01l3.105-1.74zm0 5.515v-2.04l-1.8 1.02v2.035zm1.285.72-3.105 1.735v2.04l4.91-2.76v-5.51l-1.805 1.015zM16.39 7.495l1.8 1.02v2.035L20 9.535v-2.04l-1.805-1.02L16.39 7.5zm-6.2 10.45v2.035L12 21l1.805-1.02v-2.03L12 18.965l-1.805-1.02zm-3.1-3.2 1.8 1.02V13.73l-1.8-1.02v2.04zm3.1-7.25L12 8.515l1.805-1.02L12 6.475 10.195 7.5zm-4.385 1.02 1.805-1.02-1.8-1.02L4 7.5v2.04l1.805 1.015zm0 3.475L4 10.975v5.51l4.91 2.76V17.2l-3.1-1.735v-3.48z" />
      </svg>
    ),
  },
  {
    name: "Optimism",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path fillRule="evenodd" d="M3.966 15.8q.979.7 2.512.7 1.854 0 2.962-.838 1.108-.85 1.559-2.562.27-1.05.464-2.163.063-.398.064-.663 0-.874-.451-1.499a2.7 2.7 0 0 0-1.237-.95Q9.053 7.5 8.062 7.5q-3.644 0-4.52 3.437a40 40 0 0 0-.477 2.163q-.058.335-.065.674 0 1.314.966 2.026m4.65-2.775c-.247.957-.926 1.58-1.958 1.58-1.02 0-1.368-.69-1.184-1.58a27 27 0 0 1 .464-2.05c.265-1.034.89-1.58 1.956-1.58 1.017 0 1.348.68 1.173 1.58a30 30 0 0 1-.451 2.05m3.902 3.385q.076.09.214.089h1.704a.38.38 0 0 0 .238-.089.36.36 0 0 0 .138-.232l.538-2.52h1.733c1.094 0 1.95-.53 2.576-1.002q.953-.707 1.266-2.186.075-.348.075-.67 0-1.117-.851-1.71-.84-.591-2.23-.591h-3.333a.38.38 0 0 0-.238.09.38.38 0 0 0-.138.232l-1.73 8.356a.3.3 0 0 0 .038.232m6.09-5.966c-.157.689-.757 1.319-1.462 1.319h-1.44l.496-2.369h1.503c.512 0 .94.102.94.665q0 .165-.037.385" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Polygon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="m16.364 15.217 4.27-2.435a.73.73 0 0 0 .366-.627V7.284a.72.72 0 0 0-.366-.627l-4.27-2.435a.74.74 0 0 0-.732 0l-4.27 2.435a.72.72 0 0 0-.366.627v8.704l-2.994 1.707-2.994-1.707v-3.415l2.994-1.707 1.974 1.127V9.702l-1.608-.918a.75.75 0 0 0-.732 0l-4.27 2.435a.72.72 0 0 0-.366.627v4.87c0 .258.14.498.366.627l4.27 2.436a.75.75 0 0 0 .732 0l4.27-2.436a.72.72 0 0 0 .366-.626V8.012l.053-.03 2.94-1.677 2.994 1.707v3.415l-2.994 1.707-1.972-1.124v2.291l1.606.916a.75.75 0 0 0 .732 0z" />
      </svg>
    ),
  },
  {
    name: "Avalanche",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M7.515 19.56H4.492c-.637 0-.952 0-1.142-.114a.7.7 0 0 1-.248-.245.7.7 0 0 1-.101-.327c-.012-.216.145-.475.46-1l7.47-12.461c.32-.53.484-.794.687-.891a.79.79 0 0 1 .697 0c.202.097.36.361.675.89l1.542 2.538.005.011c.253.36.454.75.596 1.16.085.325.085.676 0 1.005a4.7 4.7 0 0 1-.596 1.172l-3.926 6.567-.011.021a4.7 4.7 0 0 1-.766 1.08 2.4 2.4 0 0 1-.927.513c-.32.08-.676.08-1.392.08m7.647 0h4.33c.648 0 .968 0 1.16-.12a.7.7 0 0 0 .246-.244.7.7 0 0 0 .101-.327c.012-.21-.14-.459-.443-.951l-.034-.053-2.171-3.51-.023-.043c-.304-.487-.461-.735-.658-.832a.77.77 0 0 0-.692 0c-.202.097-.36.357-.675.874l-2.172 3.516v.011c-.32.517-.477.777-.466.988a.7.7 0 0 0 .102.329c.06.1.145.185.246.248.187.113.507.113 1.149.113" />
      </svg>
    ),
  },
  {
    name: "Solana",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M18.413 7.903a.62.62 0 0 1-.411.162H3.58c-.512 0-.77-.585-.416-.928l2.369-2.283a.6.6 0 0 1 .41-.17H20.42c.517 0 .77.591.41.935zm0 11.255a.62.62 0 0 1-.411.157H3.58c-.512 0-.77-.58-.416-.922l2.369-2.29a.6.6 0 0 1 .41-.163H20.42c.517 0 .77.585.41.928zm0-8.686a.62.62 0 0 0-.411-.157H3.58c-.512 0-.77.58-.416.922l2.369 2.29a.6.6 0 0 0 .41.163H20.42c.517 0 .77-.585.41-.928z" />
      </svg>
    ),
  },
  {
    name: "Sui",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M16.129 10.508a5.44 5.44 0 0 1 1.148 3.356 5.47 5.47 0 0 1-1.18 3.4l-.064.079-.016-.107a5 5 0 0 0-.053-.26c-.37-1.656-1.566-3.08-3.546-4.233-1.334-.774-2.102-1.705-2.304-2.765a4.1 4.1 0 0 1 .16-1.969c.15-.494.385-.961.693-1.376l.773-.963a.334.334 0 0 1 .519 0zm1.217-.964L12.19 3.092a.243.243 0 0 0-.38 0L6.653 9.549l-.016.016a7.1 7.1 0 0 0-1.52 4.405C5.118 17.85 8.199 21 12 21s6.883-3.15 6.883-7.03a7.1 7.1 0 0 0-1.52-4.405zm-9.46.943.46-.577.017.105.037.255c.301 1.604 1.366 2.938 3.15 3.97 1.551.905 2.45 1.943 2.71 3.081.1.443.128.898.079 1.35v.027l-.021.01a5.2 5.2 0 0 1-2.319.544c-2.911 0-5.278-2.412-5.278-5.388a5.44 5.44 0 0 1 1.165-3.377" />
      </svg>
    ),
  },
  {
    name: "Aptos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M15.336 9.02a.65.65 0 0 1-.483-.217l-.643-.726a.507.507 0 0 0-.757 0l-.552.623a.95.95 0 0 1-.713.322h-8.68a9 9 0 0 0-.473 2.221h8.196a.53.53 0 0 0 .38-.163l.764-.796a.5.5 0 0 1 .365-.155h.031c.145 0 .283.061.379.17l.643.726a.65.65 0 0 0 .483.218h6.69a9 9 0 0 0-.473-2.221zm-7.341 6.894a.53.53 0 0 0 .38-.163l.764-.796a.5.5 0 0 1 .365-.156h.031c.145 0 .283.062.379.17l.643.727a.65.65 0 0 0 .483.218h9.066c.34-.702.588-1.456.736-2.244h-8.701a.65.65 0 0 1-.483-.217l-.643-.727a.507.507 0 0 0-.757 0l-.552.624a.95.95 0 0 1-.713.321H3.158c.148.789.397 1.542.737 2.243zm6.431-9.32a.53.53 0 0 0 .382-.163l.763-.796a.5.5 0 0 1 .364-.155h.032c.144 0 .283.061.378.17l.643.727a.65.65 0 0 0 .484.217h1.723A8.99 8.99 0 0 0 12.001 3a8.99 8.99 0 0 0-7.195 3.594zm-5.82 11.544a.65.65 0 0 1-.484-.218l-.643-.726a.507.507 0 0 0-.756 0l-.552.623a.95.95 0 0 1-.713.321h-.037A8.97 8.97 0 0 0 12.001 21a8.97 8.97 0 0 0 6.578-2.862z" />
      </svg>
    ),
  },
  {
    name: "Berachain",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M11.503 11.158a1 1 0 0 1-.032-.135l-.013-.064-.035-.136c.208-.303 1.202-1.884.071-2.9-1.255-1.126-2.722.35-2.722.35l.004.007a3.63 3.63 0 0 0-2.07-.006c-.008-.009-1.47-1.474-2.722-.35-1.252 1.123.1 2.94.107 2.95a1 1 0 0 0-.033.131C3.922 11.783 3 12.023 3 13.378s.965 2.47 2.934 2.47h.808c.003.004.336.458 1.02.458.633 0 1.052-.455 1.056-.459h.77c1.97 0 2.934-1.088 2.934-2.469 0-1.262-.8-1.557-1.019-2.22m9.409-1.548s.146-1.306-.967-1.586V7.5h-.862v.51c-1.174.25-1.023 1.6-1.023 1.6v.224s-.151 1.35 1.023 1.6v1.12c-1.237.218-1.081 1.612-1.081 1.612v.223s-.151 1.35 1.023 1.6v.51h.862v-.523c1.113-.28.966-1.587.966-1.587a.086.086 0 0 0 .089-.084v-.054a.086.086 0 0 0-.088-.085s.145-1.295-.953-1.583v-1.15h-.013c1.175-.25 1.024-1.599 1.024-1.599A.087.087 0 0 0 21 9.75v-.054a.087.087 0 0 0-.088-.085m-.703 4.556h-.079a.087.087 0 0 0-.088.085v.054c0 .046.04.085.088.085h.08c0 .81-.28.946-.374.969a.024.024 0 0 1-.03-.023v-.258c0-.143-.095-.221-.19-.263a.46.46 0 0 0-.377 0c-.095.042-.19.12-.19.263v.258a.024.024 0 0 1-.029.023c-.093-.023-.374-.158-.374-.97v-.223c0-.81.28-.947.373-.97.016-.003.03.008.03.023v.258c0 .143.096.221.19.264a.47.47 0 0 0 .378 0c.094-.043.188-.121.188-.264v-.258c0-.015.015-.026.03-.023.094.023.374.158.374.97m-.02-4.332h.078c0 .812-.28.947-.374.97a.024.024 0 0 1-.03-.023v-.258c0-.143-.094-.221-.188-.264a.46.46 0 0 0-.378 0c-.095.043-.189.12-.189.264v.258c0 .015-.015.026-.03.022-.094-.023-.374-.159-.374-.969V9.61c0-.811.28-.947.374-.97a.024.024 0 0 1 .03.024v.258c0 .142.095.22.189.263.12.054.258.054.378 0 .094-.042.189-.12.189-.263v-.258c0-.016.014-.027.03-.023.094.023.373.16.373.97h-.079a.086.086 0 0 0-.088.084v.054c0 .047.04.085.088.085m-3.589 2.082s.152-1.357-1.033-1.601v-1.22C16.72 8.835 16.57 7.5 16.57 7.5h-.645c0 .812-.28.947-.373.97a.024.024 0 0 1-.03-.023v-.259c0-.142-.095-.22-.19-.263a.46.46 0 0 0-.377 0c-.094.043-.189.12-.189.263v.259c0 .015-.015.026-.03.022-.094-.023-.373-.159-.373-.969h-.645s-.155 1.385 1.07 1.609v1.204c-1.194.24-1.04 1.603-1.04 1.603v.224s-.154 1.364 1.04 1.603v1.149c-1.225.223-1.07 1.608-1.07 1.608h.645c0-.811.28-.946.373-.969a.024.024 0 0 1 .03.023v.258c0 .143.095.221.19.264a.47.47 0 0 0 .377 0c.094-.043.189-.121.189-.264v-.258c0-.016.015-.027.03-.023.094.023.373.16.373.97h.645s.15-1.336-1.004-1.596v-1.163c1.185-.245 1.033-1.602 1.033-1.602a.087.087 0 0 0 .088-.085v-.054a.086.086 0 0 0-.088-.085m-.723.224h.079c0 .812-.28.947-.374.97a.024.024 0 0 1-.03-.023v-.258c0-.143-.095-.221-.189-.264a.46.46 0 0 0-.378 0c-.094.043-.189.121-.189.264v.258c0 .015-.015.026-.03.023-.094-.024-.373-.16-.373-.97v-.224c0-.811.28-.947.373-.97a.024.024 0 0 1 .03.024v.258c0 .143.095.22.19.263a.46.46 0 0 0 .377 0c.094-.042.189-.12.189-.263v-.258c0-.016.015-.027.03-.023.094.023.374.16.374.97h-.08a.087.087 0 0 0-.087.084v.054c0 .047.04.085.088.085" />
      </svg>
    ),
  },
  {
    name: "Linea",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M17.633 21H3.478V5.921h3.238v12.157h10.917zm.001-12.159c1.595 0 2.889-1.307 2.889-2.92S19.229 3 17.633 3c-1.595 0-2.888 1.308-2.888 2.92 0 1.614 1.293 2.921 2.889 2.921" />
      </svg>
    ),
  },
  {
    name: "Scroll",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M5.247 9.971C4.55 9.317 4.07 8.466 4.07 7.462v-.109c.066-1.702 1.462-3.098 3.164-3.142H18.12c.284.022.502.219.502.502v9.229c.24.044.371.087.611.153.196.065.458.218.458.218v-9.6a1.597 1.597 0 0 0-1.592-1.57H7.233A4.31 4.31 0 0 0 3 7.462c0 1.374.633 2.552 1.636 3.359.066.066.131.13.328.13.327 0 .545-.261.523-.523 0-.24-.087-.327-.24-.458" />
        <path d="M17.836 14.552h-8.53A1.03 1.03 0 0 0 8.28 15.6v1.222c.021.567.501 1.047 1.069 1.047h.632v-1.047H9.35v-1.2h.349c1.069 0 1.876 1.003 1.876 2.072 0 .96-.873 2.16-2.313 2.073-1.287-.087-1.985-1.222-1.985-2.073V7.287a.866.866 0 0 0-.85-.85h-.852v1.069h.633v10.21c-.044 2.073 1.483 3.12 3.054 3.12l8.596.022A3.143 3.143 0 0 0 21 17.716c-.022-1.767-1.418-3.164-3.164-3.164m2.073 3.208a2.09 2.09 0 0 1-2.073 2.007l-5.977-.022c.48-.545.763-1.265.763-2.05 0-1.223-.72-2.074-.72-2.074h5.956c1.135 0 2.073.939 2.073 2.073zM15.545 7.68H9.107V6.61h6.436a.53.53 0 0 1 .524.524c0 .306-.218.546-.524.546" />
        <path d="M15.545 12.698H9.107v-1.069h6.436a.53.53 0 0 1 .524.524c0 .305-.218.545-.524.545m1.137-2.509H9.107v-1.07h7.571a.536.536 0 0 1 0 1.07" />
      </svg>
    ),
  },
  {
    name: "Mantle",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="m12.928 6.082.461-2.975A9 9 0 0 0 12 3h-.005v6.075H12c.259 0 .506.034.754.096l.787-2.96a6 6 0 0 0-.613-.129m-2.39 3.387-1.52-2.605a6 6 0 0 0-.511.338L6.7 4.727a8.5 8.5 0 0 1 1.2-.743l1.378 2.683c.282-.14.563-.264.861-.36L9.204 3.44a9 9 0 0 1 1.373-.327l.484 3.027a5 5 0 0 0-.608.13l.788 2.907a2.7 2.7 0 0 0-.704.293M3.972 7.922l2.734 1.39c-.14.28-.265.562-.36.86l-2.914-.945q.219-.674.54-1.305m13.163 1.097-2.605 1.518c.13.22.225.45.293.698l2.908-.787q.085.303.13.607l3.025-.478a9 9 0 0 0-.331-1.378l-2.87.939a5.5 5.5 0 0 0-.354-.866l2.678-1.378a9 9 0 0 0-.737-1.198L16.798 8.5c.124.169.236.338.338.518m-2.368-5.586c.45.146.888.326 1.305.54L14.683 6.7a6 6 0 0 0-.855-.354zm.219 3.375-1.53 2.655c.225.13.427.281.607.467l4.287-4.303a9 9 0 0 0-1.07-.917L15.51 7.151a5 5 0 0 0-.523-.337zm-5.524 3.735-2.655-1.53a8 8 0 0 1 .343-.523L4.71 6.718c.281-.382.585-.742.917-1.069L9.93 9.936q-.272.27-.467.607m-3.251-.084 2.959.787a3 3 0 0 0-.096.754H3c0-.467.034-.94.112-1.395l2.97.461c.034-.202.08-.41.13-.607m11.081 4.23 2.734 1.39c.214-.423.393-.862.54-1.306l-2.914-.945c-.096.293-.22.585-.36.86m-3.825-.158 1.508 2.605q.271-.152.517-.338l1.806 2.475a8.5 8.5 0 0 1-1.198.743l-1.378-2.683a6 6 0 0 1-.867.36l.94 2.868c-.45.14-.912.253-1.379.326l-.478-3.026q.304-.043.608-.13l-.788-2.907q.373-.1.704-.293zm-6.604.45 2.605-1.518a2.7 2.7 0 0 1-.293-.698l-2.908.787a5 5 0 0 1-.13-.607l-3.026.478q.112.702.332 1.378l2.87-.94q.143.447.353.867L3.99 16.106c.214.416.461.821.737 1.198L7.202 15.5a5 5 0 0 1-.338-.518m2.368 5.586a9 9 0 0 1-1.305-.54L9.311 17.3q.422.21.86.354zm-.219-3.375 1.53-2.655a3 3 0 0 1-.607-.462L5.649 18.38c.332.326.692.635 1.07.91l1.771-2.435q.253.178.523.338m5.524-3.735 2.65 1.53a5 5 0 0 1-.338.529l2.435 1.766q-.413.575-.91 1.074l-4.304-4.292q.272-.27.467-.607m-3.29 1.372-.788 2.96c.202.055.405.095.613.128l-.461 2.976a9 9 0 0 0 1.389.107h.006v-6.075H12a3 3 0 0 1-.754-.096m3.582-2.075a3 3 0 0 0 .096-.754H21c0 .467-.034.94-.113 1.395l-2.97-.461a7 7 0 0 1-.129.607z" />
      </svg>
    ),
  },
];

/* The cumulus, drawn on a 1000 × 420 field. Overlapping puffs that the goo
   filter fuses into one silhouette — the same trick the hero uses. Wide and
   low rather than round: a broad top edge to perch badges on, a long underside
   for them to hang from, and — because the badges ring the silhouette — the
   flatter it is, the closer together they sit. */
const PUFFS: [number, number, number][] = [
  // the two big lobes the word sits between, offset so the cloud is not a
  // symmetric blob — a real cumulus is lopsided
  [430, 196, 128], [640, 214, 108],
  // the heaped top: one tall crown left of centre, smaller heads either side
  [330, 168, 98], [520, 134, 108], [700, 162, 82], [820, 202, 70],
  [220, 208, 88], [142, 250, 64], [878, 254, 56],
  // the base, flatter and longer than the top
  [300, 306, 82], [430, 318, 88], [560, 314, 84], [680, 304, 74],
  [204, 296, 64], [788, 292, 60], [116, 302, 44], [876, 298, 42],
];

/* Where each badge sits, in % of the field — clockwise from just left of the
   top centre. Tuned by eye against the silhouette above: the first eight ride
   the top bumps, the rest hang under the belly. Reorder the chains, not these. */
/* Spaced by arc length in PIXELS, not by percentage. The field is 1000×420, so
   a step in y% is less than half the distance of the same step in x% — placing
   these by eye in percentages left the flat top and bottom runs sparse and the
   turns at either end crowded, which showed up as a hole between the last badge
   and the first. Generated on an ellipse (rx 41%, ry 47%, centred 50%/52%) that
   sits just outside the silhouette; neighbour gaps are within 14% of each
   other. Re-run that if the cloud's proportions change. */
const SLOTS: [number, number][] = [
  [41, 6], [55, 5], [68, 10], [80, 20], [90, 40],
  [88, 69], [78, 87], [65, 96], [52, 99], [39, 97],
  [26, 90], [15, 76], [9, 49], [17, 25], [29, 12],
];

/* Sparkles over the whole field — [x%, y%, size px, delay s] */
const SPARKS: [number, number, number, number][] = [
  [8, 14, 11, 0], [92, 12, 9, 1.4], [50, 2, 8, 2.2], [4, 70, 10, 0.7],
  [96, 72, 8, 1.9], [34, 3, 7, 2.8], [66, 4, 9, 1.1],
];

/* The little cloud each badge sits on: four overlapping discs, as
   [left%, top%, diameter%] of the badge's box.

   Not a path. The obvious cloud glyph draws its underside as one straight
   segment, and the badges that overlap the big cloud then cast a hard-edged
   horizontal shadow across it that reads as a ruled line on the white. Opaque
   discs of a single colour union seamlessly with no filter, and a union of
   circles cannot produce a straight edge. */
const BADGE_PUFFS: [number, number, number][] = [
  [50, 46, 58],
  [25, 63, 42],
  [75, 63, 42],
  [50, 69, 50],
];
const BADGE_FILL = "#FBF7FF";

export default function Chains() {
  return (
    <section
      id="chains"
      className="relative isolate overflow-hidden pb-24 pt-24 sm:pb-28 sm:pt-28"
      // opens on the colour the Noid block bottoms out at, then deepens into
      // the sky the roadmap's rain falls through
      // lilac through the body, then a fast drop through the last fifth: the
      // roadmap's cloud ceiling opens on this colour, and handing it a pale
      // lilac leaves that ceiling reading as a stripe rather than as weather
      // rolling in.
      style={{
        background: `linear-gradient(180deg, ${MODES_SEAM} 0%, #B99CE9 46%, #8F6ED6 78%, ${CHAINS_SEAM} 100%)`,
      }}
    >
      <div className="menoid-grid pointer-events-none absolute inset-0 z-0 opacity-50" />

      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="ch-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          <linearGradient id="ch-cloud" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="382">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#F8F2FF" />
            <stop offset="1" stopColor="#E4D5F9" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--violet)]">
            ✦ Supported Networks ✦
          </p>
        </Reveal>

        {/* the cloud and everything hooked to it */}
        <Reveal delay={80}>
          <div className="relative mx-auto mt-10 aspect-[1000/420] w-full max-w-[980px] sm:mt-14">
            {/* the cumulus */}
            <svg
              viewBox="0 0 1000 420"
              className="absolute inset-0 h-full w-full"
              style={{ filter: "drop-shadow(0 30px 50px rgba(78,47,142,0.22))" }}
              aria-hidden
              focusable="false"
            >
              <g fill="url(#ch-cloud)" filter="url(#ch-cloudy)">
                {PUFFS.map(([cx, cy, r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} />
                ))}
              </g>
            </svg>

            {/* sparkles */}
            {SPARKS.map(([x, y, s, d], i) => (
              <svg
                key={i}
                className="spark pointer-events-none absolute"
                style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
                viewBox="0 0 24 24"
                fill="#fff"
                aria-hidden
                focusable="false"
              >
                <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
              </svg>
            ))}

            {/* the copy, sitting inside the cloud */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
              <h2
                className="font-round font-semibold tracking-[-0.03em] text-[var(--violet-deep)]"
                style={{ fontSize: "clamp(34px, 7.2vw, 88px)", lineHeight: 1, textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}
              >
                Multichain
              </h2>
            </div>

            {/* the chains, pinned around the silhouette */}
            {CHAINS.map((chain, i) => {
              const [x, y] = SLOTS[i];
              return (
                <div
                  key={chain.name}
                  className="ch-badge absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: "clamp(30px, 6.4vw, 62px)",
                    height: "clamp(30px, 6.4vw, 62px)",
                    animationDelay: `${(i % 5) * 0.55}s`,
                  }}
                  title={chain.name}
                >
                  {/* the shadow goes on the wrapper, so it is cast by the
                      union of the discs rather than by each of them */}
                  <div
                    className="absolute left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2"
                    style={{ filter: "drop-shadow(0 6px 13px rgba(64,36,122,0.24))" }}
                    aria-hidden
                  >
                    {BADGE_PUFFS.map(([bx, by, d], j) => (
                      <span
                        key={j}
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          left: `${bx}%`,
                          top: `${by}%`,
                          width: `${d}%`,
                          height: `${d}%`,
                          background: BADGE_FILL,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="relative grid h-full w-full place-items-center"
                    style={{ color: "var(--logo-ink)" }}
                  >
                    <span className="block h-[50%] w-[50%]">{chain.icon}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* White, not violet ink: this sits in the section's last fifth, which
            is where the sky drops toward CHAINS_SEAM to hand over to the
            roadmap. Violet on that is barely there. */}
        <Reveal delay={140} className="mx-auto mt-14 max-w-2xl text-center sm:mt-16">
          <p className="text-[14px] leading-relaxed text-white/85 sm:text-[15px]">
            Shield, send and swap across every chain Menoid supports — without your activity
            following you from one to the next.
          </p>
        </Reveal>
      </div>

      <style>{`
        .ch-badge { animation: chain-bob 5.5s ease-in-out infinite; will-change: transform; }
        .ch-badge > span { transition: transform 420ms var(--ease-spring); }
        .ch-badge:hover > span { transform: scale(1.14); }
        @media (prefers-reduced-motion: reduce) { .ch-badge { animation: none; } }
      `}</style>
    </section>
  );
}
