var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, Input, Output, EventEmitter, AfterContentInit, ContentChildren, ContentChild, QueryList, TemplateRef, forwardRef, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule, PrimeTemplate, Footer, Header } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { ObjectUtils } from 'primeng/utils';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FilterUtils } from 'primeng/utils';
export const LISTBOX_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Listbox),
    multi: true
};
let Listbox = class Listbox {
    constructor(el, cd) {
        this.el = el;
        this.cd = cd;
        this.checkbox = false;
        this.filter = false;
        this.filterMode = 'contains';
        this.metaKeySelection = true;
        this.showToggleAll = true;
        this.onChange = new EventEmitter();
        this.onClick = new EventEmitter();
        this.onDblClick = new EventEmitter();
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
        this.disabledSelectedOptions = [];
    }
    get options() {
        return this._options;
    }
    set options(val) {
        let opts = this.optionLabel ? ObjectUtils.generateSelectItems(val, this.optionLabel) : val;
        this._options = opts;
    }
    get filterValue() {
        return this._filterValue;
    }
    set filterValue(val) {
        this._filterValue = val;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    writeValue(value) {
        this.value = value;
        this.setDisabledSelectedOptions();
        this.cd.markForCheck();
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(val) {
        this.disabled = val;
    }
    onOptionClick(event, option) {
        if (this.disabled || option.disabled || this.readonly) {
            return;
        }
        if (this.multiple) {
            if (this.checkbox)
                this.onOptionClickCheckbox(event, option);
            else
                this.onOptionClickMultiple(event, option);
        }
        else {
            this.onOptionClickSingle(event, option);
        }
        this.onClick.emit({
            originalEvent: event,
            option: option,
            value: this.value
        });
        this.optionTouched = false;
    }
    onOptionTouchEnd(event, option) {
        if (this.disabled || option.disabled || this.readonly) {
            return;
        }
        this.optionTouched = true;
    }
    onOptionDoubleClick(event, option) {
        if (this.disabled || option.disabled || this.readonly) {
            return;
        }
        this.onDblClick.emit({
            originalEvent: event,
            option: option,
            value: this.value
        });
    }
    onOptionClickSingle(event, option) {
        let selected = this.isSelected(option);
        let valueChanged = false;
        let metaSelection = this.optionTouched ? false : this.metaKeySelection;
        if (metaSelection) {
            let metaKey = (event.metaKey || event.ctrlKey);
            if (selected) {
                if (metaKey) {
                    this.value = null;
                    valueChanged = true;
                }
            }
            else {
                this.value = option.value;
                valueChanged = true;
            }
        }
        else {
            this.value = selected ? null : option.value;
            valueChanged = true;
        }
        if (valueChanged) {
            this.onModelChange(this.value);
            this.onChange.emit({
                originalEvent: event,
                value: this.value
            });
        }
    }
    onOptionClickMultiple(event, option) {
        let selected = this.isSelected(option);
        let valueChanged = false;
        let metaSelection = this.optionTouched ? false : this.metaKeySelection;
        if (metaSelection) {
            let metaKey = (event.metaKey || event.ctrlKey);
            if (selected) {
                if (metaKey) {
                    this.removeOption(option);
                }
                else {
                    this.value = [option.value];
                }
                valueChanged = true;
            }
            else {
                this.value = (metaKey) ? this.value || [] : [];
                this.value = [...this.value, option.value];
                valueChanged = true;
            }
        }
        else {
            if (selected) {
                this.removeOption(option);
            }
            else {
                this.value = [...this.value || [], option.value];
            }
            valueChanged = true;
        }
        if (valueChanged) {
            this.onModelChange(this.value);
            this.onChange.emit({
                originalEvent: event,
                value: this.value
            });
        }
    }
    onOptionClickCheckbox(event, option) {
        if (this.disabled || this.readonly) {
            return;
        }
        let selected = this.isSelected(option);
        if (selected) {
            this.removeOption(option);
        }
        else {
            this.value = this.value ? this.value : [];
            this.value = [...this.value, option.value];
        }
        this.onModelChange(this.value);
        this.onChange.emit({
            originalEvent: event,
            value: this.value
        });
    }
    removeOption(option) {
        this.value = this.value.filter(val => !ObjectUtils.equals(val, option.value, this.dataKey));
    }
    isSelected(option) {
        let selected = false;
        if (this.multiple) {
            if (this.value) {
                for (let val of this.value) {
                    if (ObjectUtils.equals(val, option.value, this.dataKey)) {
                        selected = true;
                        break;
                    }
                }
            }
        }
        else {
            selected = ObjectUtils.equals(this.value, option.value, this.dataKey);
        }
        return selected;
    }
    get allChecked() {
        if (this.filterValue) {
            return this.allFilteredSelected();
        }
        else {
            let optionCount = this.getEnabledOptionCount();
            let disabledSelectedOptionCount = this.disabledSelectedOptions.length;
            return this.value && this.options && (this.value.length > 0 && this.value.length == optionCount + disabledSelectedOptionCount);
        }
    }
    getEnabledOptionCount() {
        if (this.options) {
            let count = 0;
            for (let opt of this.options) {
                if (!opt.disabled) {
                    count++;
                }
            }
            return count;
        }
        else {
            return 0;
        }
    }
    allFilteredSelected() {
        let allSelected;
        let options = this.filterValue ? this.getFilteredOptions() : this.options;
        if (this.value && options && options.length) {
            allSelected = true;
            for (let opt of this.options) {
                if (this.isItemVisible(opt)) {
                    if (!this.isSelected(opt)) {
                        allSelected = false;
                        break;
                    }
                }
            }
        }
        return allSelected;
    }
    onFilter(event) {
        this._filterValue = event.target.value;
    }
    toggleAll(event) {
        if (this.disabled || this.readonly || !this.options || this.options.length === 0) {
            return;
        }
        if (this.allChecked) {
            if (this.disabledSelectedOptions && this.disabledSelectedOptions.length > 0) {
                let value = [];
                value = [...this.disabledSelectedOptions];
                this.value = value;
            }
            else {
                this.value = [];
            }
        }
        else {
            if (this.options) {
                this.value = [];
                if (this.disabledSelectedOptions && this.disabledSelectedOptions.length > 0) {
                    this.value = [...this.disabledSelectedOptions];
                }
                for (let i = 0; i < this.options.length; i++) {
                    let opt = this.options[i];
                    if (this.isItemVisible(opt) && !opt.disabled) {
                        this.value.push(opt.value);
                    }
                }
            }
        }
        this.onModelChange(this.value);
        this.onChange.emit({ originalEvent: event, value: this.value });
        event.preventDefault();
    }
    isItemVisible(option) {
        if (this.filterValue) {
            let visible;
            let filterText = ObjectUtils.removeAccents(this.filterValue).toLowerCase();
            if (this.filterMode) {
                visible = FilterUtils[this.filterMode](option.label, this.filterValue);
            }
            else {
                visible = true;
            }
            return visible;
        }
        else {
            return true;
        }
    }
    onInputFocus(event) {
        this.focus = true;
    }
    onInputBlur(event) {
        this.focus = false;
    }
    onOptionKeyDown(event, option) {
        if (this.readonly) {
            return;
        }
        let item = event.currentTarget;
        switch (event.which) {
            //down
            case 40:
                var nextItem = this.findNextItem(item);
                if (nextItem) {
                    nextItem.focus();
                }
                event.preventDefault();
                break;
            //up
            case 38:
                var prevItem = this.findPrevItem(item);
                if (prevItem) {
                    prevItem.focus();
                }
                event.preventDefault();
                break;
            //enter
            case 13:
                this.onOptionClick(event, option);
                event.preventDefault();
                break;
        }
    }
    findNextItem(item) {
        let nextItem = item.nextElementSibling;
        if (nextItem)
            return DomHandler.hasClass(nextItem, 'ui-state-disabled') || DomHandler.isHidden(nextItem) ? this.findNextItem(nextItem) : nextItem;
        else
            return null;
    }
    findPrevItem(item) {
        let prevItem = item.previousElementSibling;
        if (prevItem)
            return DomHandler.hasClass(prevItem, 'ui-state-disabled') || DomHandler.isHidden(prevItem) ? this.findPrevItem(prevItem) : prevItem;
        else
            return null;
    }
    getFilteredOptions() {
        let filteredOptions = [];
        if (this.filterValue) {
            for (let i = 0; i < this.options.length; i++) {
                let opt = this.options[i];
                if (this.isItemVisible(opt) && !opt.disabled) {
                    filteredOptions.push(opt);
                }
            }
            return filteredOptions;
        }
        else {
            return this.options;
        }
    }
    onHeaderCheckboxFocus() {
        this.headerCheckboxFocus = true;
    }
    onHeaderCheckboxBlur() {
        this.headerCheckboxFocus = false;
    }
    setDisabledSelectedOptions() {
        if (this.options) {
            this.disabledSelectedOptions = [];
            if (this.value) {
                for (let opt of this.options) {
                    if (opt.disabled && this.isSelected(opt)) {
                        this.disabledSelectedOptions.push(opt.value);
                    }
                }
            }
        }
    }
};
Listbox.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
__decorate([
    Input()
], Listbox.prototype, "multiple", void 0);
__decorate([
    Input()
], Listbox.prototype, "style", void 0);
__decorate([
    Input()
], Listbox.prototype, "styleClass", void 0);
__decorate([
    Input()
], Listbox.prototype, "listStyle", void 0);
__decorate([
    Input()
], Listbox.prototype, "readonly", void 0);
__decorate([
    Input()
], Listbox.prototype, "disabled", void 0);
__decorate([
    Input()
], Listbox.prototype, "checkbox", void 0);
__decorate([
    Input()
], Listbox.prototype, "filter", void 0);
__decorate([
    Input()
], Listbox.prototype, "filterMode", void 0);
__decorate([
    Input()
], Listbox.prototype, "metaKeySelection", void 0);
__decorate([
    Input()
], Listbox.prototype, "dataKey", void 0);
__decorate([
    Input()
], Listbox.prototype, "showToggleAll", void 0);
__decorate([
    Input()
], Listbox.prototype, "optionLabel", void 0);
__decorate([
    Input()
], Listbox.prototype, "ariaFilterLabel", void 0);
__decorate([
    Input()
], Listbox.prototype, "filterPlaceHolder", void 0);
__decorate([
    Output()
], Listbox.prototype, "onChange", void 0);
__decorate([
    Output()
], Listbox.prototype, "onClick", void 0);
__decorate([
    Output()
], Listbox.prototype, "onDblClick", void 0);
__decorate([
    ViewChild('headerchkbox')
], Listbox.prototype, "headerCheckboxViewChild", void 0);
__decorate([
    ContentChild(Header)
], Listbox.prototype, "headerFacet", void 0);
__decorate([
    ContentChild(Footer)
], Listbox.prototype, "footerFacet", void 0);
__decorate([
    ContentChildren(PrimeTemplate)
], Listbox.prototype, "templates", void 0);
__decorate([
    Input()
], Listbox.prototype, "options", null);
__decorate([
    Input()
], Listbox.prototype, "filterValue", null);
Listbox = __decorate([
    Component({
        selector: 'p-listbox',
        template: `
    <div [ngClass]="{'ui-listbox ui-inputtext ui-widget ui-widget-content ui-corner-all':true,'ui-state-disabled':disabled,'ui-state-focus':focus}" [ngStyle]="style" [class]="styleClass">
      <div class="ui-helper-hidden-accessible">
        <input type="text" readonly="readonly" (focus)="onInputFocus($event)" (blur)="onInputBlur($event)">
      </div>
      <div class="ui-widget-header ui-corner-all ui-listbox-header ui-helper-clearfix" *ngIf="headerFacet">
        <ng-content select="p-header"></ng-content>
      </div>
      <div class="ui-widget-header ui-corner-all ui-listbox-header ui-helper-clearfix" *ngIf="(checkbox && multiple && showToggleAll) || filter" [ngClass]="{'ui-listbox-header-w-checkbox': checkbox}">
        <div class="ui-chkbox ui-widget" *ngIf="checkbox && multiple && showToggleAll">
          <div class="ui-helper-hidden-accessible">
            <input type="checkbox" readonly="readonly" [checked]="allChecked" (focus)="onHeaderCheckboxFocus()" (blur)="onHeaderCheckboxBlur()" (keydown.space)="toggleAll($event)">
          </div>
          <div #headerchkbox class="ui-chkbox-box ui-widget ui-corner-all ui-state-default" [ngClass]="{'ui-state-active': allChecked, 'ui-state-focus': headerCheckboxFocus}" (click)="toggleAll($event)">
            <span class="ui-chkbox-icon ui-clickable" [ngClass]="{'pi pi-check':allChecked}"></span>
          </div>
        </div>
        <div class="ui-listbox-filter-container" *ngIf="filter">
          <input type="text" [value]="filterValue||''" (input)="onFilter($event)" class="ui-inputtext ui-widget ui-state-default ui-corner-all" [disabled]="disabled" [attr.placeholder]="filterPlaceHolder" [attr.aria-label]="ariaFilterLabel">
          <span class="ui-listbox-filter-icon pi pi-search"></span>
        </div>
      </div>
      <div class="ui-listbox-list-wrapper" [ngStyle]="listStyle">
        <ul class="ui-listbox-list" role="listbox" aria-multiselectable="multiple">
          <li *ngFor="let option of options; let i = index;" [style.display]="isItemVisible(option) ? 'block' : 'none'" [attr.tabindex]="option.disabled ? null : '0'"
              [ngClass]="{'ui-listbox-item ui-corner-all':true,'ui-state-highlight':isSelected(option), 'ui-state-disabled': option.disabled}" role="option" [attr.aria-label]="option.label"
              [attr.aria-selected]="isSelected(option)" (click)="onOptionClick($event,option)" (dblclick)="onOptionDoubleClick($event,option)" (touchend)="onOptionTouchEnd($event,option)" (keydown)="onOptionKeyDown($event,option)">
            <div class="ui-chkbox ui-widget" *ngIf="checkbox && multiple">
              <div class="ui-chkbox-box ui-widget ui-corner-all ui-state-default" [ngClass]="{'ui-state-active':isSelected(option)}">
                <span class="ui-chkbox-icon ui-clickable" [ngClass]="{'pi pi-check':isSelected(option)}"></span>
              </div>
            </div>
            <span *ngIf="!itemTemplate">{{option.label}}</span>
            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: option, index: i}"></ng-container>
          </li>
        </ul>
      </div>
      <div class="ui-listbox-footer ui-widget-header ui-corner-all" *ngIf="footerFacet">
        <ng-content select="p-footer"></ng-content>
      </div>
    </div>
  `,
        providers: [LISTBOX_VALUE_ACCESSOR],
        changeDetection: ChangeDetectionStrategy.Default
    })
], Listbox);
export { Listbox };
let ListboxModule = class ListboxModule {
};
ListboxModule = __decorate([
    NgModule({
        imports: [CommonModule, SharedModule],
        exports: [Listbox, SharedModule],
        declarations: [Listbox]
    })
], ListboxModule);
export { ListboxModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGJveC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL3ByaW1lbmcvbGlzdGJveC8iLCJzb3VyY2VzIjpbImxpc3Rib3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hPLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsaUJBQWlCLEVBQXdCLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU1QyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBUTtJQUN2QyxPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ3RDLEtBQUssRUFBRSxJQUFJO0NBQ2QsQ0FBQztBQWlERixJQUFhLE9BQU8sR0FBcEIsTUFBYSxPQUFPO0lBb0VoQixZQUFtQixFQUFjLEVBQVMsRUFBcUI7UUFBNUMsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFTLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBdER0RCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBRTFCLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFFeEIsZUFBVSxHQUFXLFVBQVUsQ0FBQztRQUVoQyxxQkFBZ0IsR0FBWSxJQUFJLENBQUM7UUFJakMsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFRN0IsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRWpELFlBQU8sR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVoRCxlQUFVLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFrQnRELGtCQUFhLEdBQWEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLG1CQUFjLEdBQWEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBVXJDLDRCQUF1QixHQUFpQixFQUFFLENBQUM7SUFFaUIsQ0FBQztJQUUzRCxJQUFJLE9BQU87UUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxHQUFVO1FBQ2xCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDM0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVRLElBQUksV0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksV0FBVyxDQUFDLEdBQVc7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7SUFDNUIsQ0FBQztJQUVELGtCQUFrQjtRQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUIsUUFBUSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BCLEtBQUssTUFBTTtvQkFDUCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ2xDLE1BQU07Z0JBRVY7b0JBQ0ksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUNsQyxNQUFNO2FBQ2I7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBVTtRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxFQUFZO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxFQUFZO1FBQzFCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFZO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU07UUFDdkIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNuRCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUNiLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O2dCQUUxQyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2pEO2FBQ0k7WUFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDZCxhQUFhLEVBQUUsS0FBSztZQUNwQixNQUFNLEVBQUUsTUFBTTtZQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztTQUNwQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE1BQU07UUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNuRCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRUQsbUJBQW1CLENBQUMsS0FBWSxFQUFFLE1BQWtCO1FBQ2hELElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkQsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7WUFDakIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsTUFBTSxFQUFFLE1BQU07WUFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7U0FDcEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVELG1CQUFtQixDQUFDLEtBQUssRUFBRSxNQUFNO1FBQzdCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBRXZFLElBQUksYUFBYSxFQUFFO1lBQ2YsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxJQUFJLFFBQVEsRUFBRTtnQkFDVixJQUFJLE9BQU8sRUFBRTtvQkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDbEIsWUFBWSxHQUFHLElBQUksQ0FBQztpQkFDdkI7YUFDSjtpQkFDSTtnQkFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLFlBQVksR0FBRyxJQUFJLENBQUM7YUFDdkI7U0FDSjthQUNJO1lBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUM1QyxZQUFZLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxZQUFZLEVBQUU7WUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDZixhQUFhLEVBQUUsS0FBSztnQkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2FBQ3BCLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELHFCQUFxQixDQUFDLEtBQUssRUFBRSxNQUFNO1FBQy9CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBRXZFLElBQUksYUFBYSxFQUFFO1lBQ2YsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxJQUFJLFFBQVEsRUFBRTtnQkFDVixJQUFJLE9BQU8sRUFBRTtvQkFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM3QjtxQkFDSTtvQkFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvQjtnQkFDRCxZQUFZLEdBQUcsSUFBSSxDQUFDO2FBQ3ZCO2lCQUNJO2dCQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNDLFlBQVksR0FBRyxJQUFJLENBQUM7YUFDdkI7U0FDSjthQUNJO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3QjtpQkFDSTtnQkFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEQ7WUFFRCxZQUFZLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxZQUFZLEVBQUU7WUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDZixhQUFhLEVBQUUsS0FBSztnQkFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2FBQ3BCLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELHFCQUFxQixDQUFDLEtBQUssRUFBRSxNQUFNO1FBQy9CLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hDLE9BQU87U0FDVjtRQUVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkMsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzdCO2FBQ0k7WUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2YsYUFBYSxFQUFFLEtBQUs7WUFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ3BCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBVztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxVQUFVLENBQUMsTUFBa0I7UUFDekIsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXJCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWixLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ3hCLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ3JELFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ2hCLE1BQU07cUJBQ1Q7aUJBQ0o7YUFDSjtTQUNKO2FBQ0k7WUFDRCxRQUFRLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pFO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELElBQUksVUFBVTtRQUNWLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1NBQ3JDO2FBQ0k7WUFDRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMvQyxJQUFJLDJCQUEyQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUM7WUFFdEUsT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksV0FBVyxHQUFHLDJCQUEyQixDQUFDLENBQUM7U0FDbEk7SUFDTCxDQUFDO0lBRUQscUJBQXFCO1FBQ2pCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7b0JBQ2YsS0FBSyxFQUFFLENBQUM7aUJBQ1g7YUFDSjtZQUVELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO2FBQ0k7WUFDRCxPQUFPLENBQUMsQ0FBQztTQUNaO0lBQ0wsQ0FBQztJQUVELG1CQUFtQjtRQUNmLElBQUksV0FBb0IsQ0FBQztRQUN6QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUUxRSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUc7WUFDMUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUNuQixLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzFCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3ZCLFdBQVcsR0FBRyxLQUFLLENBQUM7d0JBQ3BCLE1BQU07cUJBQ1Q7aUJBQ0o7YUFDSjtTQUNKO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFLO1FBQ1YsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUMzQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQUs7UUFDWCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzlFLE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekUsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNmLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2FBQ3RCO2lCQUNJO2dCQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ25CO1NBQ0o7YUFDSTtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3pFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO2lCQUNsRDtnQkFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7d0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDOUI7aUJBQ0o7YUFDSjtTQUNKO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNoRSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFrQjtRQUM1QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUUzRSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pCLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3pFO2lCQUNJO2dCQUNELE9BQU8sR0FBRyxJQUFJLENBQUM7YUFDbEI7WUFFRCxPQUFPLE9BQU8sQ0FBQztTQUNsQjthQUNJO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBSztRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBSztRQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxlQUFlLENBQUMsS0FBbUIsRUFBRSxNQUFNO1FBQ3ZDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxHQUFtQixLQUFLLENBQUMsYUFBYSxDQUFDO1FBRS9DLFFBQU8sS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNoQixNQUFNO1lBQ04sS0FBSyxFQUFFO2dCQUNILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksUUFBUSxFQUFFO29CQUNWLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDcEI7Z0JBRUQsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzQixNQUFNO1lBRU4sSUFBSTtZQUNKLEtBQUssRUFBRTtnQkFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLFFBQVEsRUFBRTtvQkFDVixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3BCO2dCQUVELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUVOLE9BQU87WUFDUCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtTQUNUO0lBQ0wsQ0FBQztJQUVELFlBQVksQ0FBQyxJQUFJO1FBQ2IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBRXZDLElBQUksUUFBUTtZQUNSLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7O1lBRXBJLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBSTtRQUNiLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUUzQyxJQUFJLFFBQVE7WUFDUixPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDOztZQUVwSSxPQUFPLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7b0JBQzFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzdCO2FBQ0o7WUFDRCxPQUFPLGVBQWUsQ0FBQztTQUMxQjthQUNJO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQztJQUVELHFCQUFxQjtRQUNqQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0lBQ3BDLENBQUM7SUFFRCxvQkFBb0I7UUFDaEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNyQyxDQUFDO0lBRUQsMEJBQTBCO1FBQ3RCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7WUFDbEMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNaLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDMUIsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3RDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUNoRDtpQkFDSjthQUNKO1NBQ0o7SUFDTCxDQUFDO0NBQ0osQ0FBQTs7WUFuYTBCLFVBQVU7WUFBYSxpQkFBaUI7O0FBbEV0RDtJQUFSLEtBQUssRUFBRTt5Q0FBbUI7QUFFbEI7SUFBUixLQUFLLEVBQUU7c0NBQVk7QUFFWDtJQUFSLEtBQUssRUFBRTsyQ0FBb0I7QUFFbkI7SUFBUixLQUFLLEVBQUU7MENBQWdCO0FBRWY7SUFBUixLQUFLLEVBQUU7eUNBQW1CO0FBRWxCO0lBQVIsS0FBSyxFQUFFO3lDQUFtQjtBQUVsQjtJQUFSLEtBQUssRUFBRTt5Q0FBMkI7QUFFMUI7SUFBUixLQUFLLEVBQUU7dUNBQXlCO0FBRXhCO0lBQVIsS0FBSyxFQUFFOzJDQUFpQztBQUVoQztJQUFSLEtBQUssRUFBRTtpREFBa0M7QUFFakM7SUFBUixLQUFLLEVBQUU7d0NBQWlCO0FBRWhCO0lBQVIsS0FBSyxFQUFFOzhDQUErQjtBQUU5QjtJQUFSLEtBQUssRUFBRTs0Q0FBcUI7QUFFcEI7SUFBUixLQUFLLEVBQUU7Z0RBQXlCO0FBRXhCO0lBQVIsS0FBSyxFQUFFO2tEQUEyQjtBQUV6QjtJQUFULE1BQU0sRUFBRTt5Q0FBa0Q7QUFFakQ7SUFBVCxNQUFNLEVBQUU7d0NBQWlEO0FBRWhEO0lBQVQsTUFBTSxFQUFFOzJDQUFvRDtBQUVsQztJQUExQixTQUFTLENBQUMsY0FBYyxDQUFDO3dEQUFxQztBQUV6QztJQUFyQixZQUFZLENBQUMsTUFBTSxDQUFDOzRDQUFhO0FBRVo7SUFBckIsWUFBWSxDQUFDLE1BQU0sQ0FBQzs0Q0FBYTtBQUVGO0lBQS9CLGVBQWUsQ0FBQyxhQUFhLENBQUM7MENBQTJCO0FBMEJqRDtJQUFSLEtBQUssRUFBRTtzQ0FFUDtBQU9RO0lBQVIsS0FBSyxFQUFFOzBDQUVQO0FBakZRLE9BQU87SUEvQ25CLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxXQUFXO1FBQ3JCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Q1g7UUFDQyxTQUFTLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztRQUNuQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztLQUNuRCxDQUFDO0dBQ1csT0FBTyxDQXVlbkI7U0F2ZVksT0FBTztBQThlcEIsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtDQUFJLENBQUE7QUFBakIsYUFBYTtJQUx6QixRQUFRLENBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDO1FBQ3JDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUM7UUFDaEMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO0tBQzFCLENBQUM7R0FDVyxhQUFhLENBQUk7U0FBakIsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgQWZ0ZXJDb250ZW50SW5pdCwgQ29udGVudENoaWxkcmVuLCBDb250ZW50Q2hpbGQsIFF1ZXJ5TGlzdCwgVGVtcGxhdGVSZWYsZm9yd2FyZFJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIFZpZXdDaGlsZCwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBTZWxlY3RJdGVtIH0gZnJvbSAncHJpbWVuZy9hcGknO1xuaW1wb3J0IHsgU2hhcmVkTW9kdWxlLCBQcmltZVRlbXBsYXRlLCBGb290ZXIsIEhlYWRlciB9IGZyb20gJ3ByaW1lbmcvYXBpJztcbmltcG9ydCB7IERvbUhhbmRsZXIgfSBmcm9tICdwcmltZW5nL2RvbSc7XG5pbXBvcnQgeyBPYmplY3RVdGlscyB9IGZyb20gJ3ByaW1lbmcvdXRpbHMnO1xuaW1wb3J0IHsgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgRmlsdGVyVXRpbHMgfSBmcm9tICdwcmltZW5nL3V0aWxzJztcblxuZXhwb3J0IGNvbnN0IExJU1RCT1hfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBMaXN0Ym94KSxcbiAgICBtdWx0aTogdHJ1ZVxufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLWxpc3Rib3gnLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBbbmdDbGFzc109XCJ7J3VpLWxpc3Rib3ggdWktaW5wdXR0ZXh0IHVpLXdpZGdldCB1aS13aWRnZXQtY29udGVudCB1aS1jb3JuZXItYWxsJzp0cnVlLCd1aS1zdGF0ZS1kaXNhYmxlZCc6ZGlzYWJsZWQsJ3VpLXN0YXRlLWZvY3VzJzpmb2N1c31cIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwidWktaGVscGVyLWhpZGRlbi1hY2Nlc3NpYmxlXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHJlYWRvbmx5PVwicmVhZG9ubHlcIiAoZm9jdXMpPVwib25JbnB1dEZvY3VzKCRldmVudClcIiAoYmx1cik9XCJvbklucHV0Qmx1cigkZXZlbnQpXCI+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci1hbGwgdWktbGlzdGJveC1oZWFkZXIgdWktaGVscGVyLWNsZWFyZml4XCIgKm5nSWY9XCJoZWFkZXJGYWNldFwiPlxuICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJwLWhlYWRlclwiPjwvbmctY29udGVudD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVpLXdpZGdldC1oZWFkZXIgdWktY29ybmVyLWFsbCB1aS1saXN0Ym94LWhlYWRlciB1aS1oZWxwZXItY2xlYXJmaXhcIiAqbmdJZj1cIihjaGVja2JveCAmJiBtdWx0aXBsZSAmJiBzaG93VG9nZ2xlQWxsKSB8fCBmaWx0ZXJcIiBbbmdDbGFzc109XCJ7J3VpLWxpc3Rib3gtaGVhZGVyLXctY2hlY2tib3gnOiBjaGVja2JveH1cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInVpLWNoa2JveCB1aS13aWRnZXRcIiAqbmdJZj1cImNoZWNrYm94ICYmIG11bHRpcGxlICYmIHNob3dUb2dnbGVBbGxcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktaGVscGVyLWhpZGRlbi1hY2Nlc3NpYmxlXCI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgcmVhZG9ubHk9XCJyZWFkb25seVwiIFtjaGVja2VkXT1cImFsbENoZWNrZWRcIiAoZm9jdXMpPVwib25IZWFkZXJDaGVja2JveEZvY3VzKClcIiAoYmx1cik9XCJvbkhlYWRlckNoZWNrYm94Qmx1cigpXCIgKGtleWRvd24uc3BhY2UpPVwidG9nZ2xlQWxsKCRldmVudClcIj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2ICNoZWFkZXJjaGtib3ggY2xhc3M9XCJ1aS1jaGtib3gtYm94IHVpLXdpZGdldCB1aS1jb3JuZXItYWxsIHVpLXN0YXRlLWRlZmF1bHRcIiBbbmdDbGFzc109XCJ7J3VpLXN0YXRlLWFjdGl2ZSc6IGFsbENoZWNrZWQsICd1aS1zdGF0ZS1mb2N1cyc6IGhlYWRlckNoZWNrYm94Rm9jdXN9XCIgKGNsaWNrKT1cInRvZ2dsZUFsbCgkZXZlbnQpXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInVpLWNoa2JveC1pY29uIHVpLWNsaWNrYWJsZVwiIFtuZ0NsYXNzXT1cInsncGkgcGktY2hlY2snOmFsbENoZWNrZWR9XCI+PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInVpLWxpc3Rib3gtZmlsdGVyLWNvbnRhaW5lclwiICpuZ0lmPVwiZmlsdGVyXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgW3ZhbHVlXT1cImZpbHRlclZhbHVlfHwnJ1wiIChpbnB1dCk9XCJvbkZpbHRlcigkZXZlbnQpXCIgY2xhc3M9XCJ1aS1pbnB1dHRleHQgdWktd2lkZ2V0IHVpLXN0YXRlLWRlZmF1bHQgdWktY29ybmVyLWFsbFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIFthdHRyLnBsYWNlaG9sZGVyXT1cImZpbHRlclBsYWNlSG9sZGVyXCIgW2F0dHIuYXJpYS1sYWJlbF09XCJhcmlhRmlsdGVyTGFiZWxcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInVpLWxpc3Rib3gtZmlsdGVyLWljb24gcGkgcGktc2VhcmNoXCI+PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVpLWxpc3Rib3gtbGlzdC13cmFwcGVyXCIgW25nU3R5bGVdPVwibGlzdFN0eWxlXCI+XG4gICAgICAgIDx1bCBjbGFzcz1cInVpLWxpc3Rib3gtbGlzdFwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1tdWx0aXNlbGVjdGFibGU9XCJtdWx0aXBsZVwiPlxuICAgICAgICAgIDxsaSAqbmdGb3I9XCJsZXQgb3B0aW9uIG9mIG9wdGlvbnM7IGxldCBpID0gaW5kZXg7XCIgW3N0eWxlLmRpc3BsYXldPVwiaXNJdGVtVmlzaWJsZShvcHRpb24pID8gJ2Jsb2NrJyA6ICdub25lJ1wiIFthdHRyLnRhYmluZGV4XT1cIm9wdGlvbi5kaXNhYmxlZCA/IG51bGwgOiAnMCdcIlxuICAgICAgICAgICAgICBbbmdDbGFzc109XCJ7J3VpLWxpc3Rib3gtaXRlbSB1aS1jb3JuZXItYWxsJzp0cnVlLCd1aS1zdGF0ZS1oaWdobGlnaHQnOmlzU2VsZWN0ZWQob3B0aW9uKSwgJ3VpLXN0YXRlLWRpc2FibGVkJzogb3B0aW9uLmRpc2FibGVkfVwiIHJvbGU9XCJvcHRpb25cIiBbYXR0ci5hcmlhLWxhYmVsXT1cIm9wdGlvbi5sYWJlbFwiXG4gICAgICAgICAgICAgIFthdHRyLmFyaWEtc2VsZWN0ZWRdPVwiaXNTZWxlY3RlZChvcHRpb24pXCIgKGNsaWNrKT1cIm9uT3B0aW9uQ2xpY2soJGV2ZW50LG9wdGlvbilcIiAoZGJsY2xpY2spPVwib25PcHRpb25Eb3VibGVDbGljaygkZXZlbnQsb3B0aW9uKVwiICh0b3VjaGVuZCk9XCJvbk9wdGlvblRvdWNoRW5kKCRldmVudCxvcHRpb24pXCIgKGtleWRvd24pPVwib25PcHRpb25LZXlEb3duKCRldmVudCxvcHRpb24pXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktY2hrYm94IHVpLXdpZGdldFwiICpuZ0lmPVwiY2hlY2tib3ggJiYgbXVsdGlwbGVcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWNoa2JveC1ib3ggdWktd2lkZ2V0IHVpLWNvcm5lci1hbGwgdWktc3RhdGUtZGVmYXVsdFwiIFtuZ0NsYXNzXT1cInsndWktc3RhdGUtYWN0aXZlJzppc1NlbGVjdGVkKG9wdGlvbil9XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1jaGtib3gtaWNvbiB1aS1jbGlja2FibGVcIiBbbmdDbGFzc109XCJ7J3BpIHBpLWNoZWNrJzppc1NlbGVjdGVkKG9wdGlvbil9XCI+PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCIhaXRlbVRlbXBsYXRlXCI+e3tvcHRpb24ubGFiZWx9fTwvc3Bhbj5cbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJpdGVtVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IG9wdGlvbiwgaW5kZXg6IGl9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVpLWxpc3Rib3gtZm9vdGVyIHVpLXdpZGdldC1oZWFkZXIgdWktY29ybmVyLWFsbFwiICpuZ0lmPVwiZm9vdGVyRmFjZXRcIj5cbiAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwicC1mb290ZXJcIj48L25nLWNvbnRlbnQ+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgICBwcm92aWRlcnM6IFtMSVNUQk9YX1ZBTFVFX0FDQ0VTU09SXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHRcbn0pXG5leHBvcnQgY2xhc3MgTGlzdGJveCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblxuICAgIEBJbnB1dCgpIG11bHRpcGxlOiBib29sZWFuO1xuXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIGxpc3RTdHlsZTogYW55O1xuXG4gICAgQElucHV0KCkgcmVhZG9ubHk6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpIGNoZWNrYm94OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBASW5wdXQoKSBmaWx0ZXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIEBJbnB1dCgpIGZpbHRlck1vZGU6IHN0cmluZyA9ICdjb250YWlucyc7XG5cbiAgICBASW5wdXQoKSBtZXRhS2V5U2VsZWN0aW9uOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIGRhdGFLZXk6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIHNob3dUb2dnbGVBbGw6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgb3B0aW9uTGFiZWw6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIGFyaWFGaWx0ZXJMYWJlbDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgZmlsdGVyUGxhY2VIb2xkZXI6IHN0cmluZztcblxuICAgIEBPdXRwdXQoKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KCkgb25DbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAT3V0cHV0KCkgb25EYmxDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgICBAVmlld0NoaWxkKCdoZWFkZXJjaGtib3gnKSBoZWFkZXJDaGVja2JveFZpZXdDaGlsZDogRWxlbWVudFJlZjtcblxuICAgIEBDb250ZW50Q2hpbGQoSGVhZGVyKSBoZWFkZXJGYWNldDtcblxuICAgIEBDb250ZW50Q2hpbGQoRm9vdGVyKSBmb290ZXJGYWNldDtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcblxuICAgIHB1YmxpYyBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBwdWJsaWMgX2ZpbHRlclZhbHVlOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgZmlsdGVyZWQ6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgdmFsdWU6IGFueTtcblxuICAgIHB1YmxpYyBvbk1vZGVsQ2hhbmdlOiBGdW5jdGlvbiA9ICgpID0+IHsgfTtcblxuICAgIHB1YmxpYyBvbk1vZGVsVG91Y2hlZDogRnVuY3Rpb24gPSAoKSA9PiB7IH07XG5cbiAgICBwdWJsaWMgb3B0aW9uVG91Y2hlZDogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBmb2N1czogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBfb3B0aW9uczogYW55W107XG5cbiAgICBwdWJsaWMgaGVhZGVyQ2hlY2tib3hGb2N1czogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBkaXNhYmxlZFNlbGVjdGVkT3B0aW9uczogU2VsZWN0SXRlbVtdID0gW107XG4gICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7IH1cblxuICAgIEBJbnB1dCgpIGdldCBvcHRpb25zKCk6IGFueVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gICAgfVxuXG4gICAgc2V0IG9wdGlvbnModmFsOiBhbnlbXSkge1xuICAgICAgICBsZXQgb3B0cyA9IHRoaXMub3B0aW9uTGFiZWwgPyBPYmplY3RVdGlscy5nZW5lcmF0ZVNlbGVjdEl0ZW1zKHZhbCwgdGhpcy5vcHRpb25MYWJlbCkgOiB2YWw7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRzO1xuICAgIH1cbiAgICBcbiAgICBASW5wdXQoKSBnZXQgZmlsdGVyVmFsdWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbHRlclZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBzZXQgZmlsdGVyVmFsdWUodmFsOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZmlsdGVyVmFsdWUgPSB2YWw7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGl0ZW0uZ2V0VHlwZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaXRlbSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1UZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNldERpc2FibGVkU2VsZWN0ZWRPcHRpb25zKCk7XG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJPbkNoYW5nZShmbjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlID0gZm47XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQgPSBmbjtcbiAgICB9XG5cbiAgICBzZXREaXNhYmxlZFN0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICB0aGlzLmRpc2FibGVkID0gdmFsO1xuICAgIH1cblxuICAgIG9uT3B0aW9uQ2xpY2soZXZlbnQsIG9wdGlvbikge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCBvcHRpb24uZGlzYWJsZWQgfHwgdGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrYm94KVxuICAgICAgICAgICAgICAgIHRoaXMub25PcHRpb25DbGlja0NoZWNrYm94KGV2ZW50LCBvcHRpb24pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMub25PcHRpb25DbGlja011bHRpcGxlKGV2ZW50LCBvcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vbk9wdGlvbkNsaWNrU2luZ2xlKGV2ZW50LCBvcHRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DbGljay5lbWl0KHtcbiAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25Ub3VjaGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgb25PcHRpb25Ub3VjaEVuZChldmVudCwgb3B0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkIHx8IG9wdGlvbi5kaXNhYmxlZCB8fCB0aGlzLnJlYWRvbmx5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdGlvblRvdWNoZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIG9uT3B0aW9uRG91YmxlQ2xpY2soZXZlbnQ6IEV2ZW50LCBvcHRpb246IFNlbGVjdEl0ZW0pOiBhbnkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCBvcHRpb24uZGlzYWJsZWQgfHwgdGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vbkRibENsaWNrLmVtaXQoe1xuICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXG4gICAgICAgICAgICBvcHRpb246IG9wdGlvbixcbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgb25PcHRpb25DbGlja1NpbmdsZShldmVudCwgb3B0aW9uKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZCA9IHRoaXMuaXNTZWxlY3RlZChvcHRpb24pO1xuICAgICAgICBsZXQgdmFsdWVDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIGxldCBtZXRhU2VsZWN0aW9uID0gdGhpcy5vcHRpb25Ub3VjaGVkID8gZmFsc2UgOiB0aGlzLm1ldGFLZXlTZWxlY3Rpb247XG5cbiAgICAgICAgaWYgKG1ldGFTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBtZXRhS2V5ID0gKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSk7XG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGlmIChtZXRhS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBvcHRpb24udmFsdWU7XG4gICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBzZWxlY3RlZCA/IG51bGwgOiBvcHRpb24udmFsdWU7XG4gICAgICAgICAgICB2YWx1ZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlQ2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk9wdGlvbkNsaWNrTXVsdGlwbGUoZXZlbnQsIG9wdGlvbikge1xuICAgICAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLmlzU2VsZWN0ZWQob3B0aW9uKTtcbiAgICAgICAgbGV0IHZhbHVlQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgbWV0YVNlbGVjdGlvbiA9IHRoaXMub3B0aW9uVG91Y2hlZCA/IGZhbHNlIDogdGhpcy5tZXRhS2V5U2VsZWN0aW9uO1xuXG4gICAgICAgIGlmIChtZXRhU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBsZXQgbWV0YUtleSA9IChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpO1xuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAobWV0YUtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZU9wdGlvbihvcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtvcHRpb24udmFsdWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IChtZXRhS2V5KSA/IHRoaXMudmFsdWUgfHwgW10gOiBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gWy4uLnRoaXMudmFsdWUsIG9wdGlvbi52YWx1ZV07XG4gICAgICAgICAgICAgICAgdmFsdWVDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlT3B0aW9uKG9wdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gWy4uLnRoaXMudmFsdWUgfHwgW10sIG9wdGlvbi52YWx1ZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhbHVlQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWVDaGFuZ2VkKSB7XG4gICAgICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQoe1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uT3B0aW9uQ2xpY2tDaGVja2JveChldmVudCwgb3B0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkIHx8IHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzZWxlY3RlZCA9IHRoaXMuaXNTZWxlY3RlZChvcHRpb24pO1xuXG4gICAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVPcHRpb24ob3B0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID8gdGhpcy52YWx1ZSA6IFtdO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFsuLi50aGlzLnZhbHVlLCBvcHRpb24udmFsdWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWUpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQoe1xuICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52YWx1ZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVPcHRpb24ob3B0aW9uOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUuZmlsdGVyKHZhbCA9PiAhT2JqZWN0VXRpbHMuZXF1YWxzKHZhbCwgb3B0aW9uLnZhbHVlLCB0aGlzLmRhdGFLZXkpKTtcbiAgICB9XG5cbiAgICBpc1NlbGVjdGVkKG9wdGlvbjogU2VsZWN0SXRlbSkge1xuICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB2YWwgb2YgdGhpcy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0VXRpbHMuZXF1YWxzKHZhbCwgb3B0aW9uLnZhbHVlLCB0aGlzLmRhdGFLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdGVkID0gT2JqZWN0VXRpbHMuZXF1YWxzKHRoaXMudmFsdWUsIG9wdGlvbi52YWx1ZSwgdGhpcy5kYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxlY3RlZDtcbiAgICB9XG5cbiAgICBnZXQgYWxsQ2hlY2tlZCgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFsbEZpbHRlcmVkU2VsZWN0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBvcHRpb25Db3VudCA9IHRoaXMuZ2V0RW5hYmxlZE9wdGlvbkNvdW50KCk7XG4gICAgICAgICAgICBsZXQgZGlzYWJsZWRTZWxlY3RlZE9wdGlvbkNvdW50ID0gdGhpcy5kaXNhYmxlZFNlbGVjdGVkT3B0aW9ucy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlICYmIHRoaXMub3B0aW9ucyAmJiAodGhpcy52YWx1ZS5sZW5ndGggPiAwICYmIHRoaXMudmFsdWUubGVuZ3RoID09IG9wdGlvbkNvdW50ICsgZGlzYWJsZWRTZWxlY3RlZE9wdGlvbkNvdW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEVuYWJsZWRPcHRpb25Db3VudCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zKSB7XG4gICAgICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgb3B0IG9mIHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFsbEZpbHRlcmVkU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIGxldCBhbGxTZWxlY3RlZDogYm9vbGVhbjtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLmZpbHRlclZhbHVlID8gdGhpcy5nZXRGaWx0ZXJlZE9wdGlvbnMoKSA6IHRoaXMub3B0aW9ucztcblxuICAgICAgICBpZiAodGhpcy52YWx1ZSAmJiBvcHRpb25zICYmIG9wdGlvbnMubGVuZ3RoKSDCoHtcbiAgICAgICAgICAgIGFsbFNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAobGV0IG9wdCBvZiB0aGlzLm9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0l0ZW1WaXNpYmxlKG9wdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQob3B0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFsbFNlbGVjdGVkO1xuICAgIH1cblxuICAgIG9uRmlsdGVyKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2ZpbHRlclZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIH1cblxuICAgIHRvZ2dsZUFsbChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCB0aGlzLnJlYWRvbmx5IHx8ICF0aGlzLm9wdGlvbnMgfHwgdGhpcy5vcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYWxsQ2hlY2tlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWRTZWxlY3RlZE9wdGlvbnMgJiYgdGhpcy5kaXNhYmxlZFNlbGVjdGVkT3B0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gW107XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBbLi4udGhpcy5kaXNhYmxlZFNlbGVjdGVkT3B0aW9uc107XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZFNlbGVjdGVkT3B0aW9ucyAmJiB0aGlzLmRpc2FibGVkU2VsZWN0ZWRPcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFsuLi50aGlzLmRpc2FibGVkU2VsZWN0ZWRPcHRpb25zXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgb3B0ID0gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0l0ZW1WaXNpYmxlKG9wdCkgJiYgIW9wdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZS5wdXNoKG9wdC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh7IG9yaWdpbmFsRXZlbnQ6IGV2ZW50LCB2YWx1ZTogdGhpcy52YWx1ZSB9KTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpc0l0ZW1WaXNpYmxlKG9wdGlvbjogU2VsZWN0SXRlbSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5maWx0ZXJWYWx1ZSkge1xuICAgICAgICAgICAgbGV0IHZpc2libGU7XG4gICAgICAgICAgICBsZXQgZmlsdGVyVGV4dCA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHModGhpcy5maWx0ZXJWYWx1ZSkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyTW9kZSkge1xuICAgICAgICAgICAgICAgIHZpc2libGUgPSBGaWx0ZXJVdGlsc1t0aGlzLmZpbHRlck1vZGVdKG9wdGlvbi5sYWJlbCx0aGlzLmZpbHRlclZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmlzaWJsZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25JbnB1dEZvY3VzKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZm9jdXMgPSB0cnVlO1xuICAgIH1cblxuICAgIG9uSW5wdXRCbHVyKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZm9jdXMgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgb25PcHRpb25LZXlEb3duKGV2ZW50OktleWJvYXJkRXZlbnQsIG9wdGlvbikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsZXQgaXRlbSA9IDxIVE1MTElFbGVtZW50PiBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoKGV2ZW50LndoaWNoKSB7XG4gICAgICAgICAgICAvL2Rvd25cbiAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gdGhpcy5maW5kTmV4dEl0ZW0oaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRJdGVtLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy91cFxuICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICB2YXIgcHJldkl0ZW0gPSB0aGlzLmZpbmRQcmV2SXRlbShpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAocHJldkl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW0uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2VudGVyXG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgIHRoaXMub25PcHRpb25DbGljayhldmVudCwgb3B0aW9uKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZmluZE5leHRJdGVtKGl0ZW0pIHtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gaXRlbS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgICAgICAgaWYgKG5leHRJdGVtKVxuICAgICAgICAgICAgcmV0dXJuIERvbUhhbmRsZXIuaGFzQ2xhc3MobmV4dEl0ZW0sICd1aS1zdGF0ZS1kaXNhYmxlZCcpIHx8IERvbUhhbmRsZXIuaXNIaWRkZW4obmV4dEl0ZW0pID8gdGhpcy5maW5kTmV4dEl0ZW0obmV4dEl0ZW0pIDogbmV4dEl0ZW07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZpbmRQcmV2SXRlbShpdGVtKSB7XG4gICAgICAgIGxldCBwcmV2SXRlbSA9IGl0ZW0ucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgXG4gICAgICAgIGlmIChwcmV2SXRlbSlcbiAgICAgICAgICAgIHJldHVybiBEb21IYW5kbGVyLmhhc0NsYXNzKHByZXZJdGVtLCAndWktc3RhdGUtZGlzYWJsZWQnKSB8fCBEb21IYW5kbGVyLmlzSGlkZGVuKHByZXZJdGVtKSA/IHRoaXMuZmluZFByZXZJdGVtKHByZXZJdGVtKSA6IHByZXZJdGVtO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IFxuICAgIFxuICAgIGdldEZpbHRlcmVkT3B0aW9ucygpIHtcbiAgICAgICAgbGV0IGZpbHRlcmVkT3B0aW9ucyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5maWx0ZXJWYWx1ZSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgb3B0ID0gdGhpcy5vcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzSXRlbVZpc2libGUob3B0KSAmJiAhb3B0LmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkT3B0aW9ucy5wdXNoKG9wdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkT3B0aW9ucztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkhlYWRlckNoZWNrYm94Rm9jdXMoKSB7XG4gICAgICAgIHRoaXMuaGVhZGVyQ2hlY2tib3hGb2N1cyA9IHRydWU7XG4gICAgfVxuXG4gICAgb25IZWFkZXJDaGVja2JveEJsdXIoKSB7XG4gICAgICAgIHRoaXMuaGVhZGVyQ2hlY2tib3hGb2N1cyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNldERpc2FibGVkU2VsZWN0ZWRPcHRpb25zKCl7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZWRTZWxlY3RlZE9wdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb3B0IG9mIHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0LmRpc2FibGVkICYmIHRoaXMuaXNTZWxlY3RlZChvcHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGVkU2VsZWN0ZWRPcHRpb25zLnB1c2gob3B0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBTaGFyZWRNb2R1bGVdLFxuICAgIGV4cG9ydHM6IFtMaXN0Ym94LCBTaGFyZWRNb2R1bGVdLFxuICAgIGRlY2xhcmF0aW9uczogW0xpc3Rib3hdXG59KVxuZXhwb3J0IGNsYXNzIExpc3Rib3hNb2R1bGUgeyB9XG5cbiJdfQ==