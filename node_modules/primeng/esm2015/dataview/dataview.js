var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, OnInit, AfterContentInit, Input, Output, EventEmitter, ContentChild, ContentChildren, QueryList, TemplateRef, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjectUtils } from 'primeng/utils';
import { Header, Footer, PrimeTemplate, SharedModule } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { FilterUtils } from 'primeng/utils';
let DataView = class DataView {
    constructor(el) {
        this.el = el;
        this.layout = 'list';
        this.pageLinks = 5;
        this.paginatorPosition = 'bottom';
        this.alwaysShowPaginator = true;
        this.paginatorDropdownScrollHeight = '200px';
        this.currentPageReportTemplate = '{currentPage} of {totalPages}';
        this.emptyMessage = 'No records found';
        this.onLazyLoad = new EventEmitter();
        this.trackBy = (index, item) => item;
        this.loadingIcon = 'pi pi-spinner';
        this.first = 0;
        this.onPage = new EventEmitter();
        this.onSort = new EventEmitter();
        this.onChangeLayout = new EventEmitter();
    }
    ngOnInit() {
        if (this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
        this.initialized = true;
    }
    ngOnChanges(simpleChanges) {
        if (simpleChanges.value) {
            this._value = simpleChanges.value.currentValue;
            this.updateTotalRecords();
            if (!this.lazy && this.hasFilter()) {
                this.filter(this.filterValue);
            }
        }
        if (simpleChanges.sortField || simpleChanges.sortOrder) {
            //avoid triggering lazy load prior to lazy initialization at onInit
            if (!this.lazy || this.initialized) {
                this.sort();
            }
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'listItem':
                    this.listItemTemplate = item.template;
                    break;
                case 'gridItem':
                    this.gridItemTemplate = item.template;
                    break;
                case 'paginatorleft':
                    this.paginatorLeftTemplate = item.template;
                    break;
                case 'paginatorright':
                    this.paginatorRightTemplate = item.template;
                    break;
            }
        });
        this.updateItemTemplate();
    }
    updateItemTemplate() {
        switch (this.layout) {
            case 'list':
                this.itemTemplate = this.listItemTemplate;
                break;
            case 'grid':
                this.itemTemplate = this.gridItemTemplate;
                break;
        }
    }
    changeLayout(layout) {
        this.layout = layout;
        this.onChangeLayout.emit({
            layout: this.layout
        });
        this.updateItemTemplate();
    }
    updateTotalRecords() {
        this.totalRecords = this.lazy ? this.totalRecords : (this._value ? this._value.length : 0);
    }
    paginate(event) {
        this.first = event.first;
        this.rows = event.rows;
        if (this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
        this.onPage.emit({
            first: this.first,
            rows: this.rows
        });
    }
    sort() {
        this.first = 0;
        if (this.lazy) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
        else if (this.value) {
            this.value.sort((data1, data2) => {
                let value1 = ObjectUtils.resolveFieldData(data1, this.sortField);
                let value2 = ObjectUtils.resolveFieldData(data2, this.sortField);
                let result = null;
                if (value1 == null && value2 != null)
                    result = -1;
                else if (value1 != null && value2 == null)
                    result = 1;
                else if (value1 == null && value2 == null)
                    result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string')
                    result = value1.localeCompare(value2);
                else
                    result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
                return (this.sortOrder * result);
            });
            if (this.hasFilter()) {
                this.filter(this.filterValue);
            }
        }
        this.onSort.emit({
            sortField: this.sortField,
            sortOrder: this.sortOrder
        });
    }
    isEmpty() {
        let data = this.filteredValue || this.value;
        return data == null || data.length == 0;
    }
    createLazyLoadMetadata() {
        return {
            first: this.first,
            rows: this.rows,
            sortField: this.sortField,
            sortOrder: this.sortOrder
        };
    }
    getBlockableElement() {
        return this.el.nativeElement.children[0];
    }
    filter(filter, filterMatchMode = "contains") {
        this.filterValue = filter;
        if (this.value && this.value.length) {
            let searchFields = this.filterBy.split(',');
            this.filteredValue = FilterUtils.filter(this.value, searchFields, filter, filterMatchMode);
            if (this.filteredValue.length === this.value.length) {
                this.filteredValue = null;
            }
            if (this.paginator) {
                this.first = 0;
                this.totalRecords = this.filteredValue ? this.filteredValue.length : this.value ? this.value.length : 0;
            }
        }
    }
    hasFilter() {
        return this.filterValue && this.filterValue.trim().length > 0;
    }
};
DataView.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], DataView.prototype, "layout", void 0);
__decorate([
    Input()
], DataView.prototype, "paginator", void 0);
__decorate([
    Input()
], DataView.prototype, "rows", void 0);
__decorate([
    Input()
], DataView.prototype, "totalRecords", void 0);
__decorate([
    Input()
], DataView.prototype, "pageLinks", void 0);
__decorate([
    Input()
], DataView.prototype, "rowsPerPageOptions", void 0);
__decorate([
    Input()
], DataView.prototype, "paginatorPosition", void 0);
__decorate([
    Input()
], DataView.prototype, "alwaysShowPaginator", void 0);
__decorate([
    Input()
], DataView.prototype, "paginatorDropdownAppendTo", void 0);
__decorate([
    Input()
], DataView.prototype, "paginatorDropdownScrollHeight", void 0);
__decorate([
    Input()
], DataView.prototype, "currentPageReportTemplate", void 0);
__decorate([
    Input()
], DataView.prototype, "showCurrentPageReport", void 0);
__decorate([
    Input()
], DataView.prototype, "lazy", void 0);
__decorate([
    Input()
], DataView.prototype, "emptyMessage", void 0);
__decorate([
    Output()
], DataView.prototype, "onLazyLoad", void 0);
__decorate([
    Input()
], DataView.prototype, "style", void 0);
__decorate([
    Input()
], DataView.prototype, "styleClass", void 0);
__decorate([
    Input()
], DataView.prototype, "trackBy", void 0);
__decorate([
    Input()
], DataView.prototype, "filterBy", void 0);
__decorate([
    Input()
], DataView.prototype, "loading", void 0);
__decorate([
    Input()
], DataView.prototype, "loadingIcon", void 0);
__decorate([
    Input()
], DataView.prototype, "first", void 0);
__decorate([
    Input()
], DataView.prototype, "sortField", void 0);
__decorate([
    Input()
], DataView.prototype, "sortOrder", void 0);
__decorate([
    Input()
], DataView.prototype, "value", void 0);
__decorate([
    Output()
], DataView.prototype, "onPage", void 0);
__decorate([
    Output()
], DataView.prototype, "onSort", void 0);
__decorate([
    Output()
], DataView.prototype, "onChangeLayout", void 0);
__decorate([
    ContentChild(Header)
], DataView.prototype, "header", void 0);
__decorate([
    ContentChild(Footer)
], DataView.prototype, "footer", void 0);
__decorate([
    ContentChildren(PrimeTemplate)
], DataView.prototype, "templates", void 0);
DataView = __decorate([
    Component({
        selector: 'p-dataView',
        template: `
        <div [ngClass]="{'ui-dataview ui-widget': true, 'ui-dataview-list': (layout === 'list'), 'ui-dataview-grid': (layout === 'grid')}" [ngStyle]="style" [class]="styleClass">
            <div class="ui-dataview-loading ui-widget-overlay" *ngIf="loading"></div>
            <div class="ui-dataview-loading-content" *ngIf="loading">
                <i [class]="'ui-dataview-loading-icon pi-spin ' + loadingIcon"></i>
            </div>
            <div class="ui-dataview-header ui-widget-header ui-corner-top">
                <ng-content select="p-header"></ng-content>
            </div>
            <p-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="paginate($event)" styleClass="ui-paginator-top" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator && (paginatorPosition === 'top' || paginatorPosition =='both')"
                [dropdownAppendTo]="paginatorDropdownAppendTo" [dropdownScrollHeight]="paginatorDropdownScrollHeight" [templateLeft]="paginatorLeftTemplate" [templateRight]="paginatorRightTemplate"
                [currentPageReportTemplate]="currentPageReportTemplate" [showCurrentPageReport]="showCurrentPageReport"></p-paginator>
            <div class="ui-dataview-content ui-widget-content">
                <div class="ui-g">
                    <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="paginator ? ((filteredValue||value) | slice:(lazy ? 0 : first):((lazy ? 0 : first) + rows)) : (filteredValue||value)" [ngForTrackBy]="trackBy">
                        <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: rowData, rowIndex: rowIndex}"></ng-container>
                    </ng-template>
                    <div *ngIf="isEmpty()" class="ui-g-12 ui-dataview-emptymessage">{{emptyMessage}}</div>
                </div>
            </div>
            <p-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="paginate($event)" styleClass="ui-paginator-bottom" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator && (paginatorPosition === 'bottom' || paginatorPosition =='both')"
                [dropdownAppendTo]="paginatorDropdownAppendTo" [dropdownScrollHeight]="paginatorDropdownScrollHeight" [templateLeft]="paginatorLeftTemplate" [templateRight]="paginatorRightTemplate"
                [currentPageReportTemplate]="currentPageReportTemplate" [showCurrentPageReport]="showCurrentPageReport"></p-paginator>
            <div class="ui-dataview-footer ui-widget-header ui-corner-bottom" *ngIf="footer">
                <ng-content select="p-footer"></ng-content>
            </div>
        </div>
    `,
        changeDetection: ChangeDetectionStrategy.Default
    })
], DataView);
export { DataView };
let DataViewLayoutOptions = class DataViewLayoutOptions {
    constructor(dv) {
        this.dv = dv;
    }
    changeLayout(event, layout) {
        this.dv.changeLayout(layout);
        event.preventDefault();
    }
};
DataViewLayoutOptions.ctorParameters = () => [
    { type: DataView }
];
__decorate([
    Input()
], DataViewLayoutOptions.prototype, "style", void 0);
__decorate([
    Input()
], DataViewLayoutOptions.prototype, "styleClass", void 0);
DataViewLayoutOptions = __decorate([
    Component({
        selector: 'p-dataViewLayoutOptions',
        template: `
        <div [ngClass]="'ui-dataview-layout-options ui-selectbutton ui-buttonset'" [ngStyle]="style" [class]="styleClass">
            <a tabindex="0" class="ui-button ui-button-icon-only ui-state-default" (click)="changeLayout($event, 'list')" (keydown.enter)="changeLayout($event, 'list')"
                [ngClass]="{'ui-state-active': dv.layout === 'list'}">
                <i class="pi pi-bars ui-button-icon-left"></i>
                <span class="ui-button-text ui-clickable">ui-btn</span>
            </a><a tabindex="0" class="ui-button ui-button-icon-only ui-state-default" (click)="changeLayout($event, 'grid')" (keydown.enter)="changeLayout($event, 'grid')"
                [ngClass]="{'ui-state-active': dv.layout === 'grid'}">
                <i class="pi pi-th-large ui-button-icon-left"></i>
                <span class="ui-button-text ui-clickable">ui-btn</span>
            </a>
        </div>
    `
    })
], DataViewLayoutOptions);
export { DataViewLayoutOptions };
let DataViewModule = class DataViewModule {
};
DataViewModule = __decorate([
    NgModule({
        imports: [CommonModule, SharedModule, PaginatorModule],
        exports: [DataView, SharedModule, DataViewLayoutOptions],
        declarations: [DataView, DataViewLayoutOptions]
    })
], DataViewModule);
export { DataViewModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YXZpZXcuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wcmltZW5nL2RhdGF2aWV3LyIsInNvdXJjZXMiOlsiZGF0YXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLE1BQU0sRUFBQyxnQkFBZ0IsRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsZUFBZSxFQUFDLFNBQVMsRUFBQyxXQUFXLEVBQUMsU0FBUyxFQUFDLGFBQWEsRUFBQyx1QkFBdUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqTixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxhQUFhLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVsRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBb0MxQyxJQUFhLFFBQVEsR0FBckIsTUFBYSxRQUFRO0lBa0ZqQixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQWhGeEIsV0FBTSxHQUFXLE1BQU0sQ0FBQztRQVF4QixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBSXRCLHNCQUFpQixHQUFXLFFBQVEsQ0FBQztRQUVyQyx3QkFBbUIsR0FBWSxJQUFJLENBQUM7UUFJcEMsa0NBQTZCLEdBQVcsT0FBTyxDQUFDO1FBRWhELDhCQUF5QixHQUFXLCtCQUErQixDQUFDO1FBTXBFLGlCQUFZLEdBQVcsa0JBQWtCLENBQUM7UUFFekMsZUFBVSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBTXBELFlBQU8sR0FBYSxDQUFDLEtBQWEsRUFBRSxJQUFTLEVBQUUs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LENBQUM7S0FDakQsQ0FBQztHQUNXLGNBQWMsQ0FBSTtTQUFsQixjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsRWxlbWVudFJlZixPbkluaXQsQWZ0ZXJDb250ZW50SW5pdCxJbnB1dCxPdXRwdXQsRXZlbnRFbWl0dGVyLENvbnRlbnRDaGlsZCxDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LFRlbXBsYXRlUmVmLE9uQ2hhbmdlcyxTaW1wbGVDaGFuZ2VzLENoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtPYmplY3RVdGlsc30gZnJvbSAncHJpbWVuZy91dGlscyc7XG5pbXBvcnQge0hlYWRlcixGb290ZXIsUHJpbWVUZW1wbGF0ZSxTaGFyZWRNb2R1bGV9IGZyb20gJ3ByaW1lbmcvYXBpJztcbmltcG9ydCB7UGFnaW5hdG9yTW9kdWxlfSBmcm9tICdwcmltZW5nL3BhZ2luYXRvcic7XG5pbXBvcnQge0Jsb2NrYWJsZVVJfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge0ZpbHRlclV0aWxzfSBmcm9tICdwcmltZW5nL3V0aWxzJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLWRhdGFWaWV3JyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsndWktZGF0YXZpZXcgdWktd2lkZ2V0JzogdHJ1ZSwgJ3VpLWRhdGF2aWV3LWxpc3QnOiAobGF5b3V0ID09PSAnbGlzdCcpLCAndWktZGF0YXZpZXctZ3JpZCc6IChsYXlvdXQgPT09ICdncmlkJyl9XCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWRhdGF2aWV3LWxvYWRpbmcgdWktd2lkZ2V0LW92ZXJsYXlcIiAqbmdJZj1cImxvYWRpbmdcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1kYXRhdmlldy1sb2FkaW5nLWNvbnRlbnRcIiAqbmdJZj1cImxvYWRpbmdcIj5cbiAgICAgICAgICAgICAgICA8aSBbY2xhc3NdPVwiJ3VpLWRhdGF2aWV3LWxvYWRpbmctaWNvbiBwaS1zcGluICcgKyBsb2FkaW5nSWNvblwiPjwvaT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWRhdGF2aWV3LWhlYWRlciB1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci10b3BcIj5cbiAgICAgICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJwLWhlYWRlclwiPjwvbmctY29udGVudD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHAtcGFnaW5hdG9yIFtyb3dzXT1cInJvd3NcIiBbZmlyc3RdPVwiZmlyc3RcIiBbdG90YWxSZWNvcmRzXT1cInRvdGFsUmVjb3Jkc1wiIFtwYWdlTGlua1NpemVdPVwicGFnZUxpbmtzXCIgW2Fsd2F5c1Nob3ddPVwiYWx3YXlzU2hvd1BhZ2luYXRvclwiXG4gICAgICAgICAgICAgICAgKG9uUGFnZUNoYW5nZSk9XCJwYWdpbmF0ZSgkZXZlbnQpXCIgc3R5bGVDbGFzcz1cInVpLXBhZ2luYXRvci10b3BcIiBbcm93c1BlclBhZ2VPcHRpb25zXT1cInJvd3NQZXJQYWdlT3B0aW9uc1wiICpuZ0lmPVwicGFnaW5hdG9yICYmIChwYWdpbmF0b3JQb3NpdGlvbiA9PT0gJ3RvcCcgfHwgcGFnaW5hdG9yUG9zaXRpb24gPT0nYm90aCcpXCJcbiAgICAgICAgICAgICAgICBbZHJvcGRvd25BcHBlbmRUb109XCJwYWdpbmF0b3JEcm9wZG93bkFwcGVuZFRvXCIgW2Ryb3Bkb3duU2Nyb2xsSGVpZ2h0XT1cInBhZ2luYXRvckRyb3Bkb3duU2Nyb2xsSGVpZ2h0XCIgW3RlbXBsYXRlTGVmdF09XCJwYWdpbmF0b3JMZWZ0VGVtcGxhdGVcIiBbdGVtcGxhdGVSaWdodF09XCJwYWdpbmF0b3JSaWdodFRlbXBsYXRlXCJcbiAgICAgICAgICAgICAgICBbY3VycmVudFBhZ2VSZXBvcnRUZW1wbGF0ZV09XCJjdXJyZW50UGFnZVJlcG9ydFRlbXBsYXRlXCIgW3Nob3dDdXJyZW50UGFnZVJlcG9ydF09XCJzaG93Q3VycmVudFBhZ2VSZXBvcnRcIj48L3AtcGFnaW5hdG9yPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWRhdGF2aWV3LWNvbnRlbnQgdWktd2lkZ2V0LWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktZ1wiPlxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LXJvd0RhdGEgbGV0LXJvd0luZGV4PVwiaW5kZXhcIiBbbmdGb3JPZl09XCJwYWdpbmF0b3IgPyAoKGZpbHRlcmVkVmFsdWV8fHZhbHVlKSB8IHNsaWNlOihsYXp5ID8gMCA6IGZpcnN0KTooKGxhenkgPyAwIDogZmlyc3QpICsgcm93cykpIDogKGZpbHRlcmVkVmFsdWV8fHZhbHVlKVwiIFtuZ0ZvclRyYWNrQnldPVwidHJhY2tCeVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIml0ZW1UZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogcm93RGF0YSwgcm93SW5kZXg6IHJvd0luZGV4fVwiPjwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2ICpuZ0lmPVwiaXNFbXB0eSgpXCIgY2xhc3M9XCJ1aS1nLTEyIHVpLWRhdGF2aWV3LWVtcHR5bWVzc2FnZVwiPnt7ZW1wdHlNZXNzYWdlfX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHAtcGFnaW5hdG9yIFtyb3dzXT1cInJvd3NcIiBbZmlyc3RdPVwiZmlyc3RcIiBbdG90YWxSZWNvcmRzXT1cInRvdGFsUmVjb3Jkc1wiIFtwYWdlTGlua1NpemVdPVwicGFnZUxpbmtzXCIgW2Fsd2F5c1Nob3ddPVwiYWx3YXlzU2hvd1BhZ2luYXRvclwiXG4gICAgICAgICAgICAgICAgKG9uUGFnZUNoYW5nZSk9XCJwYWdpbmF0ZSgkZXZlbnQpXCIgc3R5bGVDbGFzcz1cInVpLXBhZ2luYXRvci1ib3R0b21cIiBbcm93c1BlclBhZ2VPcHRpb25zXT1cInJvd3NQZXJQYWdlT3B0aW9uc1wiICpuZ0lmPVwicGFnaW5hdG9yICYmIChwYWdpbmF0b3JQb3NpdGlvbiA9PT0gJ2JvdHRvbScgfHwgcGFnaW5hdG9yUG9zaXRpb24gPT0nYm90aCcpXCJcbiAgICAgICAgICAgICAgICBbZHJvcGRvd25BcHBlbmRUb109XCJwYWdpbmF0b3JEcm9wZG93bkFwcGVuZFRvXCIgW2Ryb3Bkb3duU2Nyb2xsSGVpZ2h0XT1cInBhZ2luYXRvckRyb3Bkb3duU2Nyb2xsSGVpZ2h0XCIgW3RlbXBsYXRlTGVmdF09XCJwYWdpbmF0b3JMZWZ0VGVtcGxhdGVcIiBbdGVtcGxhdGVSaWdodF09XCJwYWdpbmF0b3JSaWdodFRlbXBsYXRlXCJcbiAgICAgICAgICAgICAgICBbY3VycmVudFBhZ2VSZXBvcnRUZW1wbGF0ZV09XCJjdXJyZW50UGFnZVJlcG9ydFRlbXBsYXRlXCIgW3Nob3dDdXJyZW50UGFnZVJlcG9ydF09XCJzaG93Q3VycmVudFBhZ2VSZXBvcnRcIj48L3AtcGFnaW5hdG9yPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWRhdGF2aWV3LWZvb3RlciB1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci1ib3R0b21cIiAqbmdJZj1cImZvb3RlclwiPlxuICAgICAgICAgICAgICAgIDxuZy1jb250ZW50IHNlbGVjdD1cInAtZm9vdGVyXCI+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIERhdGFWaWV3IGltcGxlbWVudHMgT25Jbml0LEFmdGVyQ29udGVudEluaXQsQmxvY2thYmxlVUksT25DaGFuZ2VzIHtcblxuICAgIEBJbnB1dCgpIGxheW91dDogc3RyaW5nID0gJ2xpc3QnO1xuXG4gICAgQElucHV0KCkgcGFnaW5hdG9yOiBib29sZWFuO1xuXG4gICAgQElucHV0KCkgcm93czogbnVtYmVyO1xuICAgIFxuICAgIEBJbnB1dCgpIHRvdGFsUmVjb3JkczogbnVtYmVyO1xuXG4gICAgQElucHV0KCkgcGFnZUxpbmtzOiBudW1iZXIgPSA1O1xuICAgIFxuICAgIEBJbnB1dCgpIHJvd3NQZXJQYWdlT3B0aW9uczogYW55W107XG5cbiAgICBASW5wdXQoKSBwYWdpbmF0b3JQb3NpdGlvbjogc3RyaW5nID0gJ2JvdHRvbSc7XG4gICAgXG4gICAgQElucHV0KCkgYWx3YXlzU2hvd1BhZ2luYXRvcjogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSBwYWdpbmF0b3JEcm9wZG93bkFwcGVuZFRvOiBhbnk7XG5cbiAgICBASW5wdXQoKSBwYWdpbmF0b3JEcm9wZG93blNjcm9sbEhlaWdodDogc3RyaW5nID0gJzIwMHB4JztcblxuICAgIEBJbnB1dCgpIGN1cnJlbnRQYWdlUmVwb3J0VGVtcGxhdGU6IHN0cmluZyA9ICd7Y3VycmVudFBhZ2V9IG9mIHt0b3RhbFBhZ2VzfSc7XG5cbiAgICBASW5wdXQoKSBzaG93Q3VycmVudFBhZ2VSZXBvcnQ6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSBsYXp5OiBib29sZWFuO1xuXG4gICAgQElucHV0KCkgZW1wdHlNZXNzYWdlOiBzdHJpbmcgPSAnTm8gcmVjb3JkcyBmb3VuZCc7XG4gICAgXG4gICAgQE91dHB1dCgpIG9uTGF6eUxvYWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIHRyYWNrQnk6IEZ1bmN0aW9uID0gKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkgPT4gaXRlbTtcblxuICAgIEBJbnB1dCgpIGZpbHRlckJ5OiBzdHJpbmc7XG4gICAgXG4gICAgQElucHV0KCkgbG9hZGluZzogYm9vbGVhbjtcblxuICAgIEBJbnB1dCgpIGxvYWRpbmdJY29uOiBzdHJpbmcgPSAncGkgcGktc3Bpbm5lcic7XG5cbiAgICBASW5wdXQoKSBmaXJzdDogbnVtYmVyID0gMDtcblxuICAgIEBJbnB1dCgpIHNvcnRGaWVsZDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgc29ydE9yZGVyOiBudW1iZXI7XG5cbiAgICBASW5wdXQoKSB2YWx1ZTogYW55W107XG5cbiAgICBAT3V0cHV0KCkgb25QYWdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIEBPdXRwdXQoKSBvblNvcnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uQ2hhbmdlTGF5b3V0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBAQ29udGVudENoaWxkKEhlYWRlcikgaGVhZGVyO1xuXG4gICAgQENvbnRlbnRDaGlsZChGb290ZXIpIGZvb3RlcjtcbiAgICBcbiAgICBAQ29udGVudENoaWxkcmVuKFByaW1lVGVtcGxhdGUpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XG4gICAgXG4gICAgX3ZhbHVlOiBhbnlbXTtcbiAgICBcbiAgICBsaXN0SXRlbVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gICAgZ3JpZEl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIHBhZ2luYXRvckxlZnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIHBhZ2luYXRvclJpZ2h0VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgXG4gICAgZmlsdGVyZWRWYWx1ZTogYW55W107XG5cbiAgICBmaWx0ZXJWYWx1ZTogc3RyaW5nO1xuXG4gICAgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmKSB7fVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmxhenkpIHtcbiAgICAgICAgICAgIHRoaXMub25MYXp5TG9hZC5lbWl0KHRoaXMuY3JlYXRlTGF6eUxvYWRNZXRhZGF0YSgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBuZ09uQ2hhbmdlcyhzaW1wbGVDaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChzaW1wbGVDaGFuZ2VzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl92YWx1ZSA9IHNpbXBsZUNoYW5nZXMudmFsdWUuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVUb3RhbFJlY29yZHMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCF0aGlzLmxhenkgJiYgdGhpcy5oYXNGaWx0ZXIoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKHRoaXMuZmlsdGVyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNpbXBsZUNoYW5nZXMuc29ydEZpZWxkIHx8IHNpbXBsZUNoYW5nZXMuc29ydE9yZGVyKSB7XG4gICAgICAgICAgICAvL2F2b2lkIHRyaWdnZXJpbmcgbGF6eSBsb2FkIHByaW9yIHRvIGxhenkgaW5pdGlhbGl6YXRpb24gYXQgb25Jbml0XG4gICAgICAgICAgICBpZiAoIXRoaXMubGF6eSB8fCB0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3J0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2goaXRlbS5nZXRUeXBlKCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdsaXN0SXRlbSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdEl0ZW1UZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2FzZSAnZ3JpZEl0ZW0nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyaWRJdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncGFnaW5hdG9ybGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFnaW5hdG9yTGVmdFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhZ2luYXRvcnJpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0b3JSaWdodFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVJdGVtVGVtcGxhdGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVJdGVtVGVtcGxhdGUoKSB7XG4gICAgICAgIHN3aXRjaCh0aGlzLmxheW91dCkge1xuICAgICAgICAgICAgY2FzZSAnbGlzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSB0aGlzLmxpc3RJdGVtVGVtcGxhdGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAnZ3JpZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSB0aGlzLmdyaWRJdGVtVGVtcGxhdGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjaGFuZ2VMYXlvdXQobGF5b3V0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQgPSBsYXlvdXQ7XG4gICAgICAgIHRoaXMub25DaGFuZ2VMYXlvdXQuZW1pdCh7XG4gICAgICAgICAgICBsYXlvdXQ6IHRoaXMubGF5b3V0XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZUl0ZW1UZW1wbGF0ZSgpO1xuICAgIH1cbiAgICAgICAgXG4gICAgdXBkYXRlVG90YWxSZWNvcmRzKCkge1xuICAgICAgICB0aGlzLnRvdGFsUmVjb3JkcyA9IHRoaXMubGF6eSA/IHRoaXMudG90YWxSZWNvcmRzIDogKHRoaXMuX3ZhbHVlID8gdGhpcy5fdmFsdWUubGVuZ3RoIDogMCk7XG4gICAgfVxuXG4gICAgcGFnaW5hdGUoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5maXJzdCA9IGV2ZW50LmZpcnN0O1xuICAgICAgICB0aGlzLnJvd3MgPSBldmVudC5yb3dzO1xuXG4gICAgICAgIGlmICh0aGlzLmxhenkpIHtcbiAgICAgICAgICAgIHRoaXMub25MYXp5TG9hZC5lbWl0KHRoaXMuY3JlYXRlTGF6eUxvYWRNZXRhZGF0YSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25QYWdlLmVtaXQoe1xuICAgICAgICAgICAgZmlyc3Q6IHRoaXMuZmlyc3QsXG4gICAgICAgICAgICByb3dzOiB0aGlzLnJvd3NcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc29ydCgpIHtcbiAgICAgICAgdGhpcy5maXJzdCA9IDA7XG5cbiAgICAgICAgaWYgKHRoaXMubGF6eSkge1xuICAgICAgICAgICAgdGhpcy5vbkxhenlMb2FkLmVtaXQodGhpcy5jcmVhdGVMYXp5TG9hZE1ldGFkYXRhKCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUuc29ydCgoZGF0YTEsIGRhdGEyKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlMSA9IE9iamVjdFV0aWxzLnJlc29sdmVGaWVsZERhdGEoZGF0YTEsIHRoaXMuc29ydEZpZWxkKTtcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUyID0gT2JqZWN0VXRpbHMucmVzb2x2ZUZpZWxkRGF0YShkYXRhMiwgdGhpcy5zb3J0RmllbGQpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlMSA9PSBudWxsICYmIHZhbHVlMiAhPSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAtMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZTEgIT0gbnVsbCAmJiB2YWx1ZTIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZTEgPT0gbnVsbCAmJiB2YWx1ZTIgPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gMDtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUxID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUyID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWUxLmxvY2FsZUNvbXBhcmUodmFsdWUyKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9ICh2YWx1ZTEgPCB2YWx1ZTIpID8gLTEgOiAodmFsdWUxID4gdmFsdWUyKSA/IDEgOiAwO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLnNvcnRPcmRlciAqIHJlc3VsdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzRmlsdGVyKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcih0aGlzLmZpbHRlclZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub25Tb3J0LmVtaXQoe1xuICAgICAgICAgICAgc29ydEZpZWxkOiB0aGlzLnNvcnRGaWVsZCxcbiAgICAgICAgICAgIHNvcnRPcmRlcjogdGhpcy5zb3J0T3JkZXJcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmZpbHRlcmVkVmFsdWV8fHRoaXMudmFsdWU7XG4gICAgICAgIHJldHVybiBkYXRhID09IG51bGwgfHwgZGF0YS5sZW5ndGggPT0gMDtcbiAgICB9XG4gICAgXG4gICAgY3JlYXRlTGF6eUxvYWRNZXRhZGF0YSgpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlyc3Q6IHRoaXMuZmlyc3QsXG4gICAgICAgICAgICByb3dzOiB0aGlzLnJvd3MsXG4gICAgICAgICAgICBzb3J0RmllbGQ6IHRoaXMuc29ydEZpZWxkLFxuICAgICAgICAgICAgc29ydE9yZGVyOiB0aGlzLnNvcnRPcmRlclxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICBnZXRCbG9ja2FibGVFbGVtZW50KCk6IEhUTUxFbGVtZW50wqB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgfVxuXG4gICAgZmlsdGVyKGZpbHRlcjogc3RyaW5nLCBmaWx0ZXJNYXRjaE1vZGU6c3RyaW5nID1cImNvbnRhaW5zXCIpIHtcbiAgICAgICAgdGhpcy5maWx0ZXJWYWx1ZSA9IGZpbHRlcjtcblxuICAgICAgICBpZiAodGhpcy52YWx1ZSAmJiB0aGlzLnZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IHNlYXJjaEZpZWxkcyA9IHRoaXMuZmlsdGVyQnkuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyZWRWYWx1ZSA9IEZpbHRlclV0aWxzLmZpbHRlcih0aGlzLnZhbHVlLCBzZWFyY2hGaWVsZHMsIGZpbHRlciwgZmlsdGVyTWF0Y2hNb2RlKTtcbiAgICBcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlcmVkVmFsdWUubGVuZ3RoID09PSB0aGlzLnZhbHVlLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcmVkVmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMucGFnaW5hdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbFJlY29yZHMgPSB0aGlzLmZpbHRlcmVkVmFsdWUgPyB0aGlzLmZpbHRlcmVkVmFsdWUubGVuZ3RoIDogdGhpcy52YWx1ZSA/IHRoaXMudmFsdWUubGVuZ3RoIDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAgICAgICBcbiAgICB9XG5cbiAgICBoYXNGaWx0ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlclZhbHVlICYmIHRoaXMuZmlsdGVyVmFsdWUudHJpbSgpLmxlbmd0aCA+IDA7XG4gICAgfVxufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3AtZGF0YVZpZXdMYXlvdXRPcHRpb25zJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cIid1aS1kYXRhdmlldy1sYXlvdXQtb3B0aW9ucyB1aS1zZWxlY3RidXR0b24gdWktYnV0dG9uc2V0J1wiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIj5cbiAgICAgICAgICAgIDxhIHRhYmluZGV4PVwiMFwiIGNsYXNzPVwidWktYnV0dG9uIHVpLWJ1dHRvbi1pY29uLW9ubHkgdWktc3RhdGUtZGVmYXVsdFwiIChjbGljayk9XCJjaGFuZ2VMYXlvdXQoJGV2ZW50LCAnbGlzdCcpXCIgKGtleWRvd24uZW50ZXIpPVwiY2hhbmdlTGF5b3V0KCRldmVudCwgJ2xpc3QnKVwiXG4gICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwieyd1aS1zdGF0ZS1hY3RpdmUnOiBkdi5sYXlvdXQgPT09ICdsaXN0J31cIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzcz1cInBpIHBpLWJhcnMgdWktYnV0dG9uLWljb24tbGVmdFwiPjwvaT5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInVpLWJ1dHRvbi10ZXh0IHVpLWNsaWNrYWJsZVwiPnVpLWJ0bjwvc3Bhbj5cbiAgICAgICAgICAgIDwvYT48YSB0YWJpbmRleD1cIjBcIiBjbGFzcz1cInVpLWJ1dHRvbiB1aS1idXR0b24taWNvbi1vbmx5IHVpLXN0YXRlLWRlZmF1bHRcIiAoY2xpY2spPVwiY2hhbmdlTGF5b3V0KCRldmVudCwgJ2dyaWQnKVwiIChrZXlkb3duLmVudGVyKT1cImNoYW5nZUxheW91dCgkZXZlbnQsICdncmlkJylcIlxuICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktc3RhdGUtYWN0aXZlJzogZHYubGF5b3V0ID09PSAnZ3JpZCd9XCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJwaSBwaS10aC1sYXJnZSB1aS1idXR0b24taWNvbi1sZWZ0XCI+PC9pPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWktYnV0dG9uLXRleHQgdWktY2xpY2thYmxlXCI+dWktYnRuPC9zcGFuPlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIERhdGFWaWV3TGF5b3V0T3B0aW9ucyAge1xuXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkdjogRGF0YVZpZXcpIHt9XG5cbiAgICBjaGFuZ2VMYXlvdXQoZXZlbnQ6IEV2ZW50LCBsYXlvdXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmR2LmNoYW5nZUxheW91dChsYXlvdXQpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxTaGFyZWRNb2R1bGUsUGFnaW5hdG9yTW9kdWxlXSxcbiAgICBleHBvcnRzOiBbRGF0YVZpZXcsU2hhcmVkTW9kdWxlLERhdGFWaWV3TGF5b3V0T3B0aW9uc10sXG4gICAgZGVjbGFyYXRpb25zOiBbRGF0YVZpZXcsRGF0YVZpZXdMYXlvdXRPcHRpb25zXVxufSlcbmV4cG9ydCBjbGFzcyBEYXRhVmlld01vZHVsZSB7IH1cbiJdfQ==