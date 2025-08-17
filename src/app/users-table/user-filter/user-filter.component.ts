import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, merge } from 'rxjs';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  startWith,
} from 'rxjs/operators';
import { CountryService } from '../../service/country.service';

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    FloatLabelModule,
    TranslateModule,
  ],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.css',
})
export class UserFilterComponent implements OnInit {
  @Input() total = 0;
  @Output() filtersChange = new EventEmitter<Record<string, any>>();

  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  private countryService = inject(CountryService);
  countries: { label: string; value: string }[] = [];
  private rawCodes: string[] = [];

  Languages = [
    { label: 'Uzbek', value: 'uz' },
    { label: 'English', value: 'en' },
    { label: 'Russian', value: 'ru' },
  ];

  form: FormGroup = this.fb.group({
    lang: ['uz'],
    username: [''],
    first_name: [''],
    country: [''],
    age_from: [null],
    age_to: [null],
  });

  private applyNow$ = new Subject<void>();

  ngOnInit(): void {
    const lang = this.form.get('lang')?.value || 'uz';
    this.translate.use(lang);

    this.countryService.getCountryCodes().subscribe((codes) => {
      this.rawCodes = (codes || []).map((c) => (c || '').toUpperCase());
      this.rebuildCountryOptions();
    });

    this.form.get('lang')?.valueChanges.subscribe((l: string) => {
      if (!l) return;
      this.translate.use(l);
      this.rebuildCountryOptions();
    });

    const debounced$ = this.form.valueChanges.pipe(debounceTime(500));
    const enter$ = this.applyNow$.pipe(map(() => this.form.value));

    merge(debounced$, enter$)
      .pipe(
        map((v) => this.sanitize(v)),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe((v) => this.filtersChange.emit(v));
  }

  onEnter(e: Event) {
    e.preventDefault();
    this.applyNow$.next();
  }

  private sanitize(v: any) {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === 'lang') continue;
      if (val == null) continue;

      if (typeof val === 'string') {
        const t = val.trim();
        if (!t) continue;
        out[k] = (k === 'country') ? t.toLowerCase() : t;
      } else {
        out[k] = val;
      }
    }
    return out;
  }


  reset() {
    this.form.reset({
      lang: this.form.get('lang')?.value || 'uz',
      username: '',
      first_name: '',
      country: '',
      age_from: null,
      age_to: null
    }, { emitEvent: false });
  }

  private nameOfCountry(code: string, lang: string): string {
    const region = (code || '').toUpperCase();
    try {
      const dn1 = new Intl.DisplayNames([lang], { type: 'region' });
      const n1 = dn1.of(region);
      if (n1) return n1;
    } catch { }

    try {
      const dn2 = new Intl.DisplayNames(['en'], { type: 'region' });
      const n2 = dn2.of(region);
      if (n2) return n2;
    } catch { }

    return region;
  }

  private rebuildCountryOptions() {
    const lang = this.form.get('lang')?.value || this.translate.currentLang || 'uz';
    const selected = (this.form.get('country')?.value ?? '').toLowerCase();

    this.countries = this.rawCodes
      .map(code => ({ label: this.nameOfCountry(code, lang), value: code }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));

    const exists = this.countries.some(o => o.value === selected);
    this.form.get('country')?.setValue(exists ? selected : '', { emitEvent: false });
  }
}
