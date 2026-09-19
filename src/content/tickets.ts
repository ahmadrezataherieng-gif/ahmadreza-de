/**
 * The Ticket System's helpdesk cases, as typed data.
 *
 * The organisation is fictional - "Talweber Logistik", `talweber.example`
 * (RFC 2606 reserves `.example`), private 10.20.0.0/16 addresses - and so are
 * its people and devices. None of it mirrors a real employer or a real case.
 * The technology is real: every command exists and its output has the shape
 * the real tool prints, trimmed to the lines that matter.
 *
 * Structure and machine text live here; the prose (title, reporter, symptom,
 * one sentence per diagnosis step, solution, lesson) lives in
 * `messages/apps/tickets/<locale>.json` under `tickets.<id>`, one entry per
 * step, in the same order. `scripts/test/apps.test.mjs` checks they line up.
 */

export const ticketStatuses = ['inProgress', 'waiting', 'resolved'] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = ['low', 'normal', 'high'] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export type TicketCategory = 'network' | 'printer' | 'client' | 'account' | 'hardware';

/** What was typed and what came back. Machine text: English and LTR in every locale. */
export interface MachineBlock {
  command: string;
  output: readonly string[];
}

export interface Ticket {
  id: string;
  /** The helpdesk's number. Machine text. */
  number: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  /** One entry per diagnosis step: the evidence it produced, or null for a step without a console. */
  steps: readonly (MachineBlock | null)[];
}

export const tickets: readonly Ticket[] = [
  {
    id: 'no-network',
    number: 'HD-2041',
    category: 'network',
    priority: 'high',
    status: 'resolved',
    steps: [
      {
        command: 'C:\\> ipconfig',
        output: [
          'Ethernet adapter Ethernet:',
          '   Autoconfiguration IPv4 Address. . : 169.254.83.17',
          '   Subnet Mask . . . . . . . . . . . : 255.255.0.0',
          '   Default Gateway . . . . . . . . . :',
        ],
      },
      {
        command: 'C:\\> ipconfig /renew',
        output: [
          'An error occurred while renewing interface Ethernet :',
          'unable to contact your DHCP server. Request has timed out.',
        ],
      },
      {
        command: 'PS> Get-DhcpServerv4ScopeStatistics -ScopeId 10.20.30.0',
        output: [
          'ScopeId       Free  InUse  PercentageInUse',
          '-------       ----  -----  ---------------',
          '10.20.30.0    0     200    100',
        ],
      },
    ],
  },
  {
    id: 'intranet-dns',
    number: 'HD-2044',
    category: 'network',
    priority: 'normal',
    status: 'resolved',
    steps: [
      {
        command: 'C:\\> ping -n 2 10.20.1.15',
        output: ['Reply from 10.20.1.15: bytes=32 time=1ms TTL=128', 'Reply from 10.20.1.15: bytes=32 time<1ms TTL=128'],
      },
      {
        command: 'C:\\> nslookup intranet.talweber.example',
        output: [
          'Server:  dns.google',
          'Address:  8.8.8.8',
          '',
          "*** dns.google can't find intranet.talweber.example: Non-existent domain",
        ],
      },
      {
        command: 'C:\\> ipconfig /all | findstr "DNS DHCP"',
        output: ['   DHCP Enabled. . . . . . . . . . . : Yes', '   DNS Servers . . . . . . . . . . . : 8.8.8.8'],
      },
    ],
  },
  {
    id: 'printer-postscript',
    number: 'HD-2047',
    category: 'printer',
    priority: 'normal',
    status: 'resolved',
    steps: [
      null,
      null,
      {
        command: 'PS> Get-Printer -Name "OG1-Laser" | Format-List Name,DriverName,PortName',
        output: ['Name       : OG1-Laser', 'DriverName : Microsoft PS Class Driver', 'PortName   : IP_10.20.40.21'],
      },
    ],
  },
  {
    id: 'print-queue',
    number: 'HD-2049',
    category: 'printer',
    priority: 'high',
    status: 'resolved',
    steps: [
      {
        command: 'PS> Get-PrintJob -PrinterName "EG-Laser"',
        output: [
          'Id   ComputerName  DocumentName      JobStatus',
          '--   ------------  ------------      ---------',
          '112  PC-EG-03      Lagerliste.xlsx   Error, Printing',
          '113  PC-EG-07      Angebot.pdf       Normal',
          '114  PC-EG-01      Lieferschein.pdf  Normal',
        ],
      },
      {
        command: 'PS> Remove-PrintJob -PrinterName "EG-Laser" -ID 112; Get-PrintJob -PrinterName "EG-Laser" -ID 112',
        output: [
          'Id   ComputerName  DocumentName      JobStatus',
          '--   ------------  ------------      ---------',
          '112  PC-EG-03      Lagerliste.xlsx   Deleting, Error, Printing',
        ],
      },
      {
        command: 'PS> Restart-Service Spooler; Get-PrintJob -PrinterName "EG-Laser"',
        output: [
          'Id   ComputerName  DocumentName      JobStatus',
          '--   ------------  ------------      ---------',
          '113  PC-EG-07      Angebot.pdf       Printing',
          '114  PC-EG-01      Lieferschein.pdf  Normal',
        ],
      },
    ],
  },
  {
    id: 'account-lockout',
    number: 'HD-2052',
    category: 'account',
    priority: 'normal',
    status: 'resolved',
    steps: [
      {
        command: "PS> Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4740} -MaxEvents 1",
        output: [
          'A user account was locked out.',
          'Account That Was Locked Out:',
          '    Account Name:          a.neumann',
          'Additional Information:',
          '    Caller Computer Name:  PC-LAGER-02',
        ],
      },
      {
        command: 'C:\\> cmdkey /list',
        output: [
          'Currently stored credentials:',
          '    Target: Domain:target=fs01.talweber.example',
          '    Type: Domain Password',
          '    User: TALWEBER\\a.neumann',
        ],
      },
      {
        command: 'C:\\> cmdkey /delete:fs01.talweber.example',
        output: ['CMDKEY: Credential deleted successfully.'],
      },
    ],
  },
  {
    id: 'slow-pc',
    number: 'HD-2055',
    category: 'client',
    priority: 'normal',
    status: 'waiting',
    steps: [
      {
        command: "PS> Get-Counter '\\PhysicalDisk(_Total)\\% Disk Time','\\Processor(_Total)\\% Processor Time'",
        output: [
          '\\\\pc-buero-09\\physicaldisk(_total)\\% disk time :         100',
          '\\\\pc-buero-09\\processor(_total)\\% processor time :   12.4',
        ],
      },
      {
        command: 'PS> Get-PSDrive C',
        output: [
          'Name  Used (GB)  Free (GB)  Provider    Root',
          '----  ---------  ---------  --------    ----',
          'C         236.4        1.8  FileSystem  C:\\',
        ],
      },
      {
        command: 'PS> Get-PhysicalDisk | Format-Table FriendlyName,MediaType,HealthStatus',
        output: ['FriendlyName        MediaType  HealthStatus', '------------        ---------  ------------', 'ST500LM030-2E717D   HDD        Healthy'],
      },
    ],
  },
  {
    id: 'dock-display',
    number: 'HD-2058',
    category: 'hardware',
    priority: 'normal',
    status: 'resolved',
    steps: [null, null, null],
  },
  {
    id: 'meeting-wifi',
    number: 'HD-2061',
    category: 'network',
    priority: 'normal',
    status: 'inProgress',
    steps: [
      {
        command: 'C:\\> netsh wlan show interfaces',
        output: [
          '    SSID                   : TW-Office',
          '    Radio type             : 802.11n',
          '    Band                   : 2.4 GHz',
          '    Channel                : 3',
          '    Signal                 : 58%',
        ],
      },
      {
        command: 'C:\\> netsh wlan show networks mode=bssid | findstr "SSID Channel"',
        output: [
          'SSID 1 : TW-Office',
          '         Channel            : 3',
          'SSID 2 : Nachbar-Gast',
          '         Channel            : 1',
          'SSID 3 : Praxis-WLAN',
          '         Channel            : 6',
        ],
      },
      null,
    ],
  },
  {
    id: 'share-access',
    number: 'HD-2063',
    category: 'account',
    priority: 'low',
    status: 'resolved',
    steps: [
      {
        command: 'PS> Get-ADPrincipalGroupMembership l.krause | Select-Object Name',
        output: ['Name', '----', 'Domain Users', 'Einkauf-RW'],
      },
      {
        command: 'C:\\> whoami /groups | findstr /i einkauf',
        output: [],
      },
      {
        command: 'C:\\> whoami /groups | findstr /i einkauf',
        output: ['TALWEBER\\Einkauf-RW    Group    S-1-5-21-3623811015-3361044348-30300820-1147    Mandatory group, Enabled by default, Enabled group'],
      },
    ],
  },
];

export const PRIORITY_RANK: Record<TicketPriority, number> = { high: 0, normal: 1, low: 2 };
