import { getServiceColorClass } from '../visuals/getServiceColorClass'

const exampleData = [
  {
    service: 'R2',
    line: `92.168.198.92 - - [22/Dec/2002:23:08:37 -0400] "GET / HTTP/1.1" 200 6394 www.yahoo.com    "-" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1...)" "-"`,
  },
  {
    service: 'R2',
    line: `192.168.198.92 - - [22/Dec/2002:23:08:38 -0400] "GET    /images/logo.gif HTTP/1.1" 200 807 www.yahoo.com    "http://www.some.com/" "Mozilla/4.0 (compatible; MSIE 6...)" "-"`,
  },
  {
    service: 'i2',
    line: `192.168.72.177 - - [22/Dec/2002:23:32:14 -0400] "GET    /news/sports.html HTTP/1.1" 200 3500 www.yahoo.com    "http://www.some.com/" "Mozilla/4.0 (compatible; MSIE ...)" "-"`,
  },
  {
    service: 'urapalvelu',
    line: `192.168.72.177 - - [22/Dec/2002:23:32:14 -0400] "GET    /favicon.ico HTTP/1.1" 404 1997 www.yahoo.com    "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3)..." "-"`,
  },
  {
    service: 'urapalvelu',
    line: `192.168.72.177 - - [22/Dec/2002:23:32:15 -0400] "GET    /style.css HTTP/1.1" 200 4138 www.yahoo.com    "http://www.yahoo.com/index.html" "Mozilla/5.0 (Windows..." "-"`,
  },
  {
    service: 'urapalvelu',
    line: `192.168.72.177 - - [22/Dec/2002:23:32:16 -0400] "GET    /js/ads.js HTTP/1.1" 200 10229 www.yahoo.com   "http://www.search.com/index.html" "Mozilla/5.0 (Windows..." "-" `,
  },
  {
    service: 'urapalvelu',
    line: `192.168.72.177 - - [22/Dec/2002:23:32:19 -0400] "GET    /search.php HTTP/1.1" 400 1997 www.yahoo.com    "-" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; ...)" "-"`,
  },
]

export const LogData: React.FC<{ services: string[] }> = ({ services }) => {
  const entries = exampleData.filter((l) => services.includes(l.service))
  return (
    <div className="text-left p-4 grow">
      {entries.map((entry, i) => (
        <div key={i} className="flex">
          <div className={`whitespace-pre-wrap font-mono  ${getServiceColorClass(entry.service)} grow`}>
            {entry.line}
          </div>
          <div className="text-sm">{entry.service}</div>
        </div>
      ))}
      {!entries.length && <p>No log entries.</p>}
    </div>
  )
}
