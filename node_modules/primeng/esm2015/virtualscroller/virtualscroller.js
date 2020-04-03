var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, AfterContentInit, Input, Output, ViewChild, EventEmitter, ContentChild, ContentChildren, QueryList, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header, Footer, PrimeTemplate, SharedModule } from 'primeng/api';
import { ScrollingModule } from '@angular/cdk/scrolling';
let VirtualScroller = class VirtualScroller {
    constructor(el) {
        this.el = el;
        this.cache = true;
        this.first = 0;
        this.trackBy = (index, item) => item;
        this.onLazyLoad = new EventEmitter();
        this._totalRecords = 0;
        this.lazyValue = [];
        this.page = 0;
    }
    get totalRecords() {
        return this._totalRecords;
    }
    set totalRecords(val) {
        this._totalRecords = val;
        this.lazyValue = Array.from({ length: this._totalRecords });
        this.onLazyLoad.emit(this.createLazyLoadMetadata());
        this.first = 0;
        this.scrollTo(0);
    }
    get value() {
        return this.lazy ? this.lazyValue : this._value;
    }
    set value(val) {
        if (this.lazy) {
            if (val) {
                let arr = this.cache ? [...this.lazyValue] : Array.from({ length: this._totalRecords });
                for (let i = this.first, j = 0; i < (this.first + this.rows); i++, j++) {
                    arr[i] = val[j];
                }
                this.lazyValue = arr;
            }
        }
        else {
            this._value = val;
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                case 'loadingItem':
                    this.loadingItemTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    onScrollIndexChange(index) {
        let p = Math.floor(index / this.rows);
        if (p !== this.page) {
            this.page = p;
            this.first = this.page * this.rows;
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }
    }
    createLazyLoadMetadata() {
        return {
            first: this.first,
            rows: this.rows
        };
    }
    getBlockableElement() {
        return this.el.nativeElement.children[0];
    }
    scrollTo(index) {
        if (this.viewPortViewChild && this.viewPortViewChild['elementRef'] && this.viewPortViewChild['elementRef'].nativeElement) {
            this.viewPortViewChild['elementRef'].nativeElement.scrollTop = index * this.itemSize;
        }
    }
};
VirtualScroller.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], VirtualScroller.prototype, "itemSize", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "style", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "styleClass", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "scrollHeight", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "lazy", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "cache", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "rows", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "first", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "trackBy", void 0);
__decorate([
    ContentChild(Header)
], VirtualScroller.prototype, "header", void 0);
__decorate([
    ContentChild(Footer)
], VirtualScroller.prototype, "footer", void 0);
__decorate([
    ContentChildren(PrimeTemplate)
], VirtualScroller.prototype, "templates", void 0);
__decorate([
    ViewChild('viewport')
], VirtualScroller.prototype, "viewPortViewChild", void 0);
__decorate([
    Output()
], VirtualScroller.prototype, "onLazyLoad", void 0);
__decorate([
    Input()
], VirtualScroller.prototype, "totalRecords", null);
__decorate([
    Input()
], VirtualScroller.prototype, "value", null);
VirtualScroller = __decorate([
    Component({
        selector: 'p-virtualScroller',
        template: `
        <div [ngClass]="'ui-virtualscroller ui-widget'" [ngStyle]="style" [class]="styleClass">
            <div class="ui-virtualscroller-header ui-widget-header ui-corner-top" *ngIf="header">
                <ng-content select="p-header"></ng-content>
            </div>
            <div #content class="ui-virtualscroller-content ui-widget-content">
                <ul class="ui-virtualscroller-list">
                    <cdk-virtual-scroll-viewport #viewport [ngStyle]="{'height': scrollHeight}" [itemSize]="itemSize" (scrolledIndexChange)="onScrollIndexChange($event)">
                        <ng-container *cdkVirtualFor="let item of value; trackBy: trackBy; let i = index; let c = count; let f = first; let l = last; let e = even; let o = odd; ">
                            <li [ngStyle]="{'height': itemSize + 'px'}">
                                <ng-container *ngTemplateOutlet="item ? itemTemplate : loadingItemTemplate; context: {$implicit: item, index: i, count: c, first: f, last: l, even: e, odd: o}"></ng-container>
                            </li>
                        </ng-container>
                    </cdk-virtual-scroll-viewport>
                </ul>
            </div>
            <div class="ui-virtualscroller-footer ui-widget-header ui-corner-bottom" *ngIf="footer">
                <ng-content select="p-footer"></ng-content>
            </div>
        </div>
    `,
        changeDetection: ChangeDetectionStrategy.Default
    })
], VirtualScroller);
export { VirtualScroller };
let VirtualScrollerModule = class VirtualScrollerModule {
};
VirtualScrollerModule = __decorate([
    NgModule({
        imports: [CommonModule, ScrollingModule],
        exports: [VirtualScroller, SharedModule, ScrollingModule],
        declarations: [VirtualScroller]
    })
], VirtualScrollerModule);
export { VirtualScrollerModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbHNjcm9sbGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcHJpbWVuZy92aXJ0dWFsc2Nyb2xsZXIvIiwic291cmNlcyI6WyJ2aXJ0dWFsc2Nyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLGdCQUFnQixFQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsU0FBUyxFQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsZUFBZSxFQUFDLFNBQVMsRUFBQyxXQUFXLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUwsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLGFBQWEsRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDckUsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBNEJ2RCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBMEN4QixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQTlCeEIsVUFBSyxHQUFZLElBQUksQ0FBQztRQUl0QixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWxCLFlBQU8sR0FBYSxDQUFDLEtBQWEsRUFBRSxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQztRQVV0RCxlQUFVLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFNN0Qsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFJMUIsY0FBUyxHQUFVLEVBQUUsQ0FBQztRQUV0QixTQUFJLEdBQVcsQ0FBQyxDQUFDO0lBRW1CLENBQUM7SUFFNUIsSUFBSSxZQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBSSxZQUFZLENBQUMsR0FBVztRQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcs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U0FySFksZUFBZTtBQTRINUIsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7Q0FBSSxDQUFBO0FBQXpCLHFCQUFxQjtJQUxqQyxRQUFRLENBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUMsZUFBZSxDQUFDO1FBQ3ZDLE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBQyxZQUFZLEVBQUMsZUFBZSxDQUFDO1FBQ3ZELFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQztLQUNsQyxDQUFDO0dBQ1cscUJBQXFCLENBQUk7U0FBekIscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsRWxlbWVudFJlZixBZnRlckNvbnRlbnRJbml0LElucHV0LE91dHB1dCxWaWV3Q2hpbGQsRXZlbnRFbWl0dGVyLENvbnRlbnRDaGlsZCxDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LFRlbXBsYXRlUmVmLENoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtIZWFkZXIsRm9vdGVyLFByaW1lVGVtcGxhdGUsU2hhcmVkTW9kdWxlfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge1Njcm9sbGluZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5pbXBvcnQge0Jsb2NrYWJsZVVJfSBmcm9tICdwcmltZW5nL2FwaSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAncC12aXJ0dWFsU2Nyb2xsZXInLFxuICAgIHRlbXBsYXRlOmBcbiAgICAgICAgPGRpdiBbbmdDbGFzc109XCIndWktdmlydHVhbHNjcm9sbGVyIHVpLXdpZGdldCdcIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktdmlydHVhbHNjcm9sbGVyLWhlYWRlciB1aS13aWRnZXQtaGVhZGVyIHVpLWNvcm5lci10b3BcIiAqbmdJZj1cImhlYWRlclwiPlxuICAgICAgICAgICAgICAgIDxuZy1jb250ZW50IHNlbGVjdD1cInAtaGVhZGVyXCI+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2ICNjb250ZW50IGNsYXNzPVwidWktdmlydHVhbHNjcm9sbGVyLWNvbnRlbnQgdWktd2lkZ2V0LWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJ1aS12aXJ0dWFsc2Nyb2xsZXItbGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICA8Y2RrLXZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0ICN2aWV3cG9ydCBbbmdTdHlsZV09XCJ7J2hlaWdodCc6IHNjcm9sbEhlaWdodH1cIiBbaXRlbVNpemVdPVwiaXRlbVNpemVcIiAoc2Nyb2xsZWRJbmRleENoYW5nZSk9XCJvblNjcm9sbEluZGV4Q2hhbmdlKCRldmVudClcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKmNka1ZpcnR1YWxGb3I9XCJsZXQgaXRlbSBvZiB2YWx1ZTsgdHJhY2tCeTogdHJhY2tCeTsgbGV0IGkgPSBpbmRleDsgbGV0IGMgPSBjb3VudDsgbGV0IGYgPSBmaXJzdDsgbGV0IGwgPSBsYXN0OyBsZXQgZSA9IGV2ZW47IGxldCBvID0gb2RkOyBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgW25nU3R5bGVdPVwieydoZWlnaHQnOiBpdGVtU2l6ZSArICdweCd9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJpdGVtID8gaXRlbVRlbXBsYXRlIDogbG9hZGluZ0l0ZW1UZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogaXRlbSwgaW5kZXg6IGksIGNvdW50OiBjLCBmaXJzdDogZiwgbGFzdDogbCwgZXZlbjogZSwgb2RkOiBvfVwiPjwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgPC9jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQ+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXZpcnR1YWxzY3JvbGxlci1mb290ZXIgdWktd2lkZ2V0LWhlYWRlciB1aS1jb3JuZXItYm90dG9tXCIgKm5nSWY9XCJmb290ZXJcIj5cbiAgICAgICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJwLWZvb3RlclwiPjwvbmctY29udGVudD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdFxufSlcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsU2Nyb2xsZXIgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LEJsb2NrYWJsZVVJIHtcblxuICAgIEBJbnB1dCgpIGl0ZW1TaXplOiBudW1iZXI7IFxuXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcbiAgICBcbiAgICBASW5wdXQoKSBzY3JvbGxIZWlnaHQ6IGFueTtcblxuICAgIEBJbnB1dCgpIGxhenk6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSBjYWNoZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSByb3dzOiBudW1iZXI7XG5cbiAgICBASW5wdXQoKSBmaXJzdDogbnVtYmVyID0gMDtcbiAgICBcbiAgICBASW5wdXQoKSB0cmFja0J5OiBGdW5jdGlvbiA9IChpbmRleDogbnVtYmVyLCBpdGVtOiBhbnkpID0+IGl0ZW07XG4gICAgICAgICAgICAgICAgXG4gICAgQENvbnRlbnRDaGlsZChIZWFkZXIpIGhlYWRlcjtcblxuICAgIEBDb250ZW50Q2hpbGQoRm9vdGVyKSBmb290ZXI7XG4gICAgXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xuXG4gICAgQFZpZXdDaGlsZCgndmlld3BvcnQnKSB2aWV3UG9ydFZpZXdDaGlsZDogRWxlbWVudFJlZjtcblxuICAgIEBPdXRwdXQoKSBvbkxhenlMb2FkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIGl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIGxvYWRpbmdJdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBfdG90YWxSZWNvcmRzOiBudW1iZXIgPSAwO1xuXG4gICAgX3ZhbHVlOiBhbnlbXTtcblxuICAgIGxhenlWYWx1ZTogYW55W10gPSBbXTtcblxuICAgIHBhZ2U6IG51bWJlciA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYpIHt9XG5cbiAgICBASW5wdXQoKSBnZXQgdG90YWxSZWNvcmRzKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl90b3RhbFJlY29yZHM7XG4gICAgfVxuICAgIHNldCB0b3RhbFJlY29yZHModmFsOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fdG90YWxSZWNvcmRzID0gdmFsO1xuICAgICAgICB0aGlzLmxhenlWYWx1ZSA9IEFycmF5LmZyb20oe2xlbmd0aDogdGhpcy5fdG90YWxSZWNvcmRzfSk7XG4gICAgICAgIHRoaXMub25MYXp5TG9hZC5lbWl0KHRoaXMuY3JlYXRlTGF6eUxvYWRNZXRhZGF0YSgpKTtcbiAgICAgICAgdGhpcy5maXJzdCA9IDA7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG8oMCk7XG4gICAgfVxuXG4gICAgQElucHV0KCkgZ2V0IHZhbHVlKCk6IGFueVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF6eSA/IHRoaXMubGF6eVZhbHVlIDogdGhpcy5fdmFsdWU7XG4gICAgfVxuICAgIHNldCB2YWx1ZSh2YWw6IGFueVtdKSB7XG4gICAgICAgIGlmICh0aGlzLmxhenkpIHtcbiAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgYXJyID0gdGhpcy5jYWNoZSA/IFsuLi50aGlzLmxhenlWYWx1ZV0gOiBBcnJheS5mcm9tKHtsZW5ndGg6IHRoaXMuX3RvdGFsUmVjb3Jkc30pO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmZpcnN0LCBqID0gMDsgaSA8ICh0aGlzLmZpcnN0ICsgdGhpcy5yb3dzKTsgaSsrLCBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyW2ldID0gdmFsW2pdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxhenlWYWx1ZSA9IGFycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2goaXRlbS5nZXRUeXBlKCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdpdGVtJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnbG9hZGluZ0l0ZW0nOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRpbmdJdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25TY3JvbGxJbmRleENoYW5nZShpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIGxldCBwID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMucm93cyk7XG4gICAgICAgIGlmIChwICE9PSB0aGlzLnBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucGFnZSA9IHA7XG4gICAgICAgICAgICB0aGlzLmZpcnN0ID0gdGhpcy5wYWdlICogdGhpcy5yb3dzO1xuICAgICAgICAgICAgdGhpcy5vbkxhenlMb2FkLmVtaXQodGhpcy5jcmVhdGVMYXp5TG9hZE1ldGFkYXRhKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlTGF6eUxvYWRNZXRhZGF0YSgpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmlyc3Q6IHRoaXMuZmlyc3QsXG4gICAgICAgICAgICByb3dzOiB0aGlzLnJvd3NcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBnZXRCbG9ja2FibGVFbGVtZW50KCk6IEhUTUxFbGVtZW50wqB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgfVxuXG4gICAgc2Nyb2xsVG8oaW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy52aWV3UG9ydFZpZXdDaGlsZCAmJiB0aGlzLnZpZXdQb3J0Vmlld0NoaWxkWydlbGVtZW50UmVmJ10gJiYgdGhpcy52aWV3UG9ydFZpZXdDaGlsZFsnZWxlbWVudFJlZiddLm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMudmlld1BvcnRWaWV3Q2hpbGRbJ2VsZW1lbnRSZWYnXS5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IGluZGV4ICogdGhpcy5pdGVtU2l6ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLFNjcm9sbGluZ01vZHVsZV0sXG4gICAgZXhwb3J0czogW1ZpcnR1YWxTY3JvbGxlcixTaGFyZWRNb2R1bGUsU2Nyb2xsaW5nTW9kdWxlXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtWaXJ0dWFsU2Nyb2xsZXJdXG59KVxuZXhwb3J0IGNsYXNzIFZpcnR1YWxTY3JvbGxlck1vZHVsZSB7IH1cblxuIl19