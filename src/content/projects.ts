/**
 * Projects, as typed data. Text lives in `messages/apps/terminal/<locale>.json`
 * under `projects.<id>`. So far there is one project that certainly exists:
 * this site. Which others belong here is owed (TODO.md).
 */
export interface Project {
  id: 'amonel';
  /** Machine text: identical in every language. */
  url: string;
  source: string;
  stack: readonly string[];
}

// CONTENT-TODO CR-510
export const projects: readonly Project[] = [
  {
    id: 'amonel',
    url: 'https://ahmadreza.de',
    source: 'https://github.com/ahmadrezataherieng-gif/ahmadreza-de',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Workers'],
  },
];
