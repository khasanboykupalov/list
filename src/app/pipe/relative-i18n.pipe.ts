import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type Lang = 'uz' | 'ru' | 'en';

@Pipe({ name: 'relativeI18n', standalone: true, pure: false })
export class RelativeI18nPipe implements PipeTransform {
  constructor(private t: TranslateService) {}

  private ruPlural(n: number, forms: [string, string, string]) {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
    return forms[2];
  }

  private ruUnit(u: string, n: number) {
    const map: Record<string, [string,string,string]> = {
      year: ['год','года','лет'],
      month: ['месяц','месяца','месяцев'],
      week: ['неделя','недели','недель'],
      day: ['день','дня','дней'],
      hour: ['час','часа','часов'],
      minute: ['минута','минуты','минут'],
      second: ['секунда','секунды','секунд']
    };
    return this.ruPlural(n, map[u]);
  }

  private uzUnit(u: string) {
    const map: Record<string, string> = {
      year: 'yil', month: 'oy', week: 'hafta',
      day: 'kun', hour: 'soat', minute: 'daqiqa', second: 'soniya'
    };
    return map[u];
  }

  private enUnit(u: string, n: number) {
    const base = {year:'year',month:'month',week:'week',day:'day',hour:'hour',minute:'minute',second:'second'} as const;
    const w = base[u as keyof typeof base];
    return n === 1 ? w : w + 's';
  }

  private canonUnit(u: string): string | null {
    const s = u.toLowerCase();
    if (s.startsWith('year')) return 'year';
    if (s.startsWith('month')) return 'month';
    if (s.startsWith('week')) return 'week';
    if (s.startsWith('day')) return 'day';
    if (s.startsWith('hour')) return 'hour';
    if (s.startsWith('minute') || s.startsWith('min')) return 'minute';
    if (s.startsWith('second') || s.startsWith('sec')) return 'second';
    return null;
    }

  transform(value: string | null | undefined): string {
    if (!value) return '';

    const re = /^\s*(\d+)\s+([A-Za-z]+)(?:,\s*(\d+)\s+([A-Za-z]+))?\s+ago\s*$/;
    const m = value.match(re);
    if (!m) {
      return value;
    }

    const n1 = Number(m[1]);
    const u1 = this.canonUnit(m[2]);
    const n2 = m[3] ? Number(m[3]) : null;
    const u2 = m[4] ? this.canonUnit(m[4]) : null;
    if (!u1 || (m[3] && !u2)) return value;

    const lang = (this.t.currentLang as Lang) || 'uz';

    if (lang === 'uz') {
      const part1 = `${n1} ${this.uzUnit(u1)}`;
      const part2 = n2 ? `, ${n2} ${this.uzUnit(u2!)}` : '';
      return `${part1}${part2} oldin`;
    }

    if (lang === 'ru') {
      const part1 = `${n1} ${this.ruUnit(u1, n1)}`;
      const part2 = n2 ? `, ${n2} ${this.ruUnit(u2!, n2)}` : '';
      return `${part1}${part2} назад`;
    }

    const part1 = `${n1} ${this.enUnit(u1, n1)}`;
    const part2 = n2 ? `, ${n2} ${this.enUnit(u2!, n2)}` : '';
    return `${part1}${part2} ago`;
  }
}
