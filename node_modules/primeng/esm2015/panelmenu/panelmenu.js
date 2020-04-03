var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
export class BasePanelMenuItem {
    constructor(ref) {
        this.ref = ref;
    }
    handleClick(event, item) {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        item.expanded = !item.expanded;
        this.ref.detectChanges();
        if (!item.url) {
            event.preventDefault();
        }
        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }
    }
}
let PanelMenuSub = class PanelMenuSub extends BasePanelMenuItem {
    constructor(ref) {
        super(ref);
    }
};
PanelMenuSub.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
__decorate([
    Input()
], PanelMenuSub.prototype, "item", void 0);
__decorate([
    Input()
], PanelMenuSub.prototype, "expanded", void 0);
__decorate([
    Input()
], PanelMenuSub.prototype, "transitionOptions", void 0);
PanelMenuSub = __decorate([
    Component({
        selector: 'p-panelMenuSub',
        template: `
        <ul class="ui-submenu-list" [@submenu]="expanded ? {value: 'visible', params: {transitionParams: transitionOptions, height: '*'}} : {value: 'hidden', params: {transitionParams: transitionOptions, height: '0'}}" role="tree">
            <ng-template ngFor let-child [ngForOf]="item.items">
                <li *ngIf="child.separator" class="ui-menu-separator ui-widget-content" role="separator">
                <li *ngIf="!child.separator" class="ui-menuitem ui-corner-all" [ngClass]="child.styleClass" [class.ui-helper-hidden]="child.visible === false" [ngStyle]="child.style">
                    <a *ngIf="!child.routerLink" [href]="child.url||'#'" class="ui-menuitem-link ui-corner-all" [attr.tabindex]="item.expanded ? null : child.tabindex ? child.tabindex : '-1'" [attr.id]="child.id"
                        [ngClass]="{'ui-state-disabled':child.disabled, 'ui-state-active': child.expanded}" role="treeitem" [attr.aria-expanded]="child.expanded"
                        (click)="handleClick($event,child)" [attr.target]="child.target" [attr.title]="child.title">
                        <span class="ui-panelmenu-icon pi pi-fw" [ngClass]="{'pi-caret-right':!child.expanded,'pi-caret-down':child.expanded}" *ngIf="child.items"></span
                        ><span class="ui-menuitem-icon" [ngClass]="child.icon" *ngIf="child.icon"></span
                        ><span class="ui-menuitem-text">{{child.label}}</span>
                    </a>
                    <a *ngIf="child.routerLink" [routerLink]="child.routerLink" [queryParams]="child.queryParams" [routerLinkActive]="'ui-menuitem-link-active'" [routerLinkActiveOptions]="child.routerLinkActiveOptions||{exact:false}" class="ui-menuitem-link ui-corner-all" 
                        [ngClass]="{'ui-state-disabled':child.disabled}" [attr.tabindex]="item.expanded ? null : child.tabindex ? child.tabindex : '-1'" [attr.id]="child.id" role="treeitem" [attr.aria-expanded]="child.expanded"
                        (click)="handleClick($event,child)" [attr.target]="child.target" [attr.title]="child.title"
                        [fragment]="child.fragment" [queryParamsHandling]="child.queryParamsHandling" [preserveFragment]="child.preserveFragment" [skipLocationChange]="child.skipLocationChange" [replaceUrl]="child.replaceUrl" [state]="child.state">
                        <span class="ui-panelmenu-icon pi pi-fw" [ngClass]="{'pi-caret-right':!child.expanded,'pi-caret-down':child.expanded}" *ngIf="child.items"></span
                        ><span class="ui-menuitem-icon" [ngClass]="child.icon" *ngIf="child.icon"></span
                        ><span class="ui-menuitem-text">{{child.label}}</span>
                    </a>
                    <p-panelMenuSub [item]="child" [expanded]="child.expanded" [transitionOptions]="transitionOptions" *ngIf="child.items"></p-panelMenuSub>
                </li>
            </ng-template>
        </ul>
    `,
        animations: [
            trigger('submenu', [
                state('hidden', style({
                    height: '0px'
                })),
                state('void', style({
                    height: '{{height}}'
                }), { params: { height: '0' } }),
                state('visible', style({
                    height: '*'
                })),
                transition('visible => hidden', animate('{{transitionParams}}')),
                transition('hidden => visible', animate('{{transitionParams}}')),
                transition('void => hidden', animate('{{transitionParams}}')),
                transition('void => visible', animate('{{transitionParams}}'))
            ])
        ]
    })
], PanelMenuSub);
export { PanelMenuSub };
let PanelMenu = class PanelMenu extends BasePanelMenuItem {
    constructor(ref) {
        super(ref);
        this.multiple = true;
        this.transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
    }
    collapseAll() {
        for (let item of this.model) {
            if (item.expanded) {
                item.expanded = false;
            }
        }
    }
    handleClick(event, item) {
        if (!this.multiple) {
            for (let modelItem of this.model) {
                if (item !== modelItem && modelItem.expanded) {
                    modelItem.expanded = false;
                }
            }
        }
        this.animating = true;
        super.handleClick(event, item);
    }
    onToggleDone() {
        this.animating = false;
    }
};
PanelMenu.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
__decorate([
    Input()
], PanelMenu.prototype, "model", void 0);
__decorate([
    Input()
], PanelMenu.prototype, "style", void 0);
__decorate([
    Input()
], PanelMenu.prototype, "styleClass", void 0);
__decorate([
    Input()
], PanelMenu.prototype, "multiple", void 0);
__decorate([
    Input()
], PanelMenu.prototype, "transitionOptions", void 0);
PanelMenu = __decorate([
    Component({
        selector: 'p-panelMenu',
        template: `
        <div [class]="styleClass" [ngStyle]="style" [ngClass]="'ui-panelmenu ui-widget'">
            <ng-container *ngFor="let item of model;let f=first;let l=last;">
                <div class="ui-panelmenu-panel" [ngClass]="{'ui-helper-hidden': item.visible === false}">
                    <div [ngClass]="{'ui-widget ui-panelmenu-header ui-state-default':true,'ui-corner-top':f,'ui-corner-bottom':l&&!item.expanded,
                    'ui-state-active':item.expanded,'ui-state-disabled':item.disabled}" [class]="item.styleClass" [ngStyle]="item.style">
                        <a *ngIf="!item.routerLink" [href]="item.url||'#'" (click)="handleClick($event,item)" [attr.tabindex]="item.tabindex ? item.tabindex : '0'" [attr.id]="item.id"
                           [attr.target]="item.target" [attr.title]="item.title" class="ui-panelmenu-header-link" [attr.aria-expanded]="item.expanded" [attr.id]="item.id + '_header'" [attr.aria-controls]="item.id +'_content'">
                        <span *ngIf="item.items" class="ui-panelmenu-icon pi pi-fw" [ngClass]="{'pi-chevron-right':!item.expanded,'pi-chevron-down':item.expanded}"></span
                        ><span class="ui-menuitem-icon" [ngClass]="item.icon" *ngIf="item.icon"></span
                        ><span class="ui-menuitem-text">{{item.label}}</span>
                        </a>
                        <a *ngIf="item.routerLink" [routerLink]="item.routerLink" [queryParams]="item.queryParams" [routerLinkActive]="'ui-menuitem-link-active'" [routerLinkActiveOptions]="item.routerLinkActiveOptions||{exact:false}"
                           (click)="handleClick($event,item)" [attr.target]="item.target" [attr.title]="item.title" class="ui-panelmenu-header-link" [attr.id]="item.id" [attr.tabindex]="item.tabindex ? item.tabindex : '0'"
                           [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment" [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state">
                        <span *ngIf="item.items" class="ui-panelmenu-icon pi pi-fw" [ngClass]="{'pi-chevron-right':!item.expanded,'pi-chevron-down':item.expanded}"></span
                        ><span class="ui-menuitem-icon" [ngClass]="item.icon" *ngIf="item.icon"></span
                        ><span class="ui-menuitem-text">{{item.label}}</span>
                        </a>
                    </div>
                    <div *ngIf="item.items" class="ui-panelmenu-content-wrapper" [@rootItem]="item.expanded ? {value: 'visible', params: {transitionParams: animating ? transitionOptions : '0ms', height: '*'}} : {value: 'hidden', params: {transitionParams: transitionOptions, height: '0'}}"  (@rootItem.done)="onToggleDone()"
                         [ngClass]="{'ui-panelmenu-content-wrapper-overflown': !item.expanded||animating}">
                        <div class="ui-panelmenu-content ui-widget-content" role="region" [attr.id]="item.id +'_content' " [attr.aria-labelledby]="item.id +'_header'">
                            <p-panelMenuSub [item]="item" [expanded]="true" [transitionOptions]="transitionOptions" class="ui-panelmenu-root-submenu"></p-panelMenuSub>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `,
        animations: [
            trigger('rootItem', [
                state('hidden', style({
                    height: '0px'
                })),
                state('void', style({
                    height: '{{height}}'
                }), { params: { height: '0' } }),
                state('visible', style({
                    height: '*'
                })),
                transition('visible => hidden', animate('{{transitionParams}}')),
                transition('hidden => visible', animate('{{transitionParams}}')),
                transition('void => hidden', animate('{{transitionParams}}')),
                transition('void => visible', animate('{{transitionParams}}'))
            ])
        ],
        changeDetection: ChangeDetectionStrategy.Default
    })
], PanelMenu);
export { PanelMenu };
let PanelMenuModule = class PanelMenuModule {
};
PanelMenuModule = __decorate([
    NgModule({
        imports: [CommonModule, RouterModule],
        exports: [PanelMenu, RouterModule],
        declarations: [PanelMenu, PanelMenuSub]
    })
], PanelMenuModule);
export { PanelMenuModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxtZW51LmpzIiwic291cmNlUm9vdCI6Im5nOi8vcHJpbWVuZy9wYW5lbG1lbnUvIiwic291cmNlcyI6WyJwYW5lbG1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLGlCQUFpQixFQUFDLHVCQUF1QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2pHLE9BQU8sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsT0FBTyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDM0UsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRTdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU3QyxNQUFNLE9BQU8saUJBQWlCO0lBRTFCLFlBQW9CLEdBQXNCO1FBQXRCLFFBQUcsR0FBSCxHQUFHLENBQW1CO0lBQUcsQ0FBQztJQUU5QyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUk7UUFDbkIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDWCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDMUI7UUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNULGFBQWEsRUFBRSxLQUFLO2dCQUNwQixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztDQUNKO0FBK0NELElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQWEsU0FB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dXQsQ2hhbmdlRGV0ZWN0b3JSZWYsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHt0cmlnZ2VyLHN0YXRlLHN0eWxlLHRyYW5zaXRpb24sYW5pbWF0ZX0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TWVudUl0ZW19IGZyb20gJ3ByaW1lbmcvYXBpJztcbmltcG9ydCB7Um91dGVyTW9kdWxlfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5leHBvcnQgY2xhc3MgQmFzZVBhbmVsTWVudUl0ZW0ge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWY6IENoYW5nZURldGVjdG9yUmVmKSB7fVxuICAgICAgICBcbiAgICBoYW5kbGVDbGljayhldmVudCwgaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS5kaXNhYmxlZCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaXRlbS5leHBhbmRlZCA9ICFpdGVtLmV4cGFuZGVkO1xuICAgICAgICB0aGlzLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWl0ZW0udXJsKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIChpdGVtLmNvbW1hbmQpIHtcbiAgICAgICAgICAgIGl0ZW0uY29tbWFuZCh7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXG4gICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAncC1wYW5lbE1lbnVTdWInLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDx1bCBjbGFzcz1cInVpLXN1Ym1lbnUtbGlzdFwiIFtAc3VibWVudV09XCJleHBhbmRlZCA/IHt2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHt0cmFuc2l0aW9uUGFyYW1zOiB0cmFuc2l0aW9uT3B0aW9ucywgaGVpZ2h0OiAnKid9fSA6IHt2YWx1ZTogJ2hpZGRlbicsIHBhcmFtczoge3RyYW5zaXRpb25QYXJhbXM6IHRyYW5zaXRpb25PcHRpb25zLCBoZWlnaHQ6ICcwJ319XCIgcm9sZT1cInRyZWVcIj5cbiAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtY2hpbGQgW25nRm9yT2ZdPVwiaXRlbS5pdGVtc1wiPlxuICAgICAgICAgICAgICAgIDxsaSAqbmdJZj1cImNoaWxkLnNlcGFyYXRvclwiIGNsYXNzPVwidWktbWVudS1zZXBhcmF0b3IgdWktd2lkZ2V0LWNvbnRlbnRcIiByb2xlPVwic2VwYXJhdG9yXCI+XG4gICAgICAgICAgICAgICAgPGxpICpuZ0lmPVwiIWNoaWxkLnNlcGFyYXRvclwiIGNsYXNzPVwidWktbWVudWl0ZW0gdWktY29ybmVyLWFsbFwiIFtuZ0NsYXNzXT1cImNoaWxkLnN0eWxlQ2xhc3NcIiBbY2xhc3MudWktaGVscGVyLWhpZGRlbl09XCJjaGlsZC52aXNpYmxlID09PSBmYWxzZVwiIFtuZ1N0eWxlXT1cImNoaWxkLnN0eWxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxhICpuZ0lmPVwiIWNoaWxkLnJvdXRlckxpbmtcIiBbaHJlZl09XCJjaGlsZC51cmx8fCcjJ1wiIGNsYXNzPVwidWktbWVudWl0ZW0tbGluayB1aS1jb3JuZXItYWxsXCIgW2F0dHIudGFiaW5kZXhdPVwiaXRlbS5leHBhbmRlZCA/IG51bGwgOiBjaGlsZC50YWJpbmRleCA/IGNoaWxkLnRhYmluZGV4IDogJy0xJ1wiIFthdHRyLmlkXT1cImNoaWxkLmlkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktc3RhdGUtZGlzYWJsZWQnOmNoaWxkLmRpc2FibGVkLCAndWktc3RhdGUtYWN0aXZlJzogY2hpbGQuZXhwYW5kZWR9XCIgcm9sZT1cInRyZWVpdGVtXCIgW2F0dHIuYXJpYS1leHBhbmRlZF09XCJjaGlsZC5leHBhbmRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwiaGFuZGxlQ2xpY2soJGV2ZW50LGNoaWxkKVwiIFthdHRyLnRhcmdldF09XCJjaGlsZC50YXJnZXRcIiBbYXR0ci50aXRsZV09XCJjaGlsZC50aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1wYW5lbG1lbnUtaWNvbiBwaSBwaS1md1wiIFtuZ0NsYXNzXT1cInsncGktY2FyZXQtcmlnaHQnOiFjaGlsZC5leHBhbmRlZCwncGktY2FyZXQtZG93bic6Y2hpbGQuZXhwYW5kZWR9XCIgKm5nSWY9XCJjaGlsZC5pdGVtc1wiPjwvc3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidWktbWVudWl0ZW0taWNvblwiIFtuZ0NsYXNzXT1cImNoaWxkLmljb25cIiAqbmdJZj1cImNoaWxkLmljb25cIj48L3NwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInVpLW1lbnVpdGVtLXRleHRcIj57e2NoaWxkLmxhYmVsfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPGEgKm5nSWY9XCJjaGlsZC5yb3V0ZXJMaW5rXCIgW3JvdXRlckxpbmtdPVwiY2hpbGQucm91dGVyTGlua1wiIFtxdWVyeVBhcmFtc109XCJjaGlsZC5xdWVyeVBhcmFtc1wiIFtyb3V0ZXJMaW5rQWN0aXZlXT1cIid1aS1tZW51aXRlbS1saW5rLWFjdGl2ZSdcIiBbcm91dGVyTGlua0FjdGl2ZU9wdGlvbnNdPVwiY2hpbGQucm91dGVyTGlua0FjdGl2ZU9wdGlvbnN8fHtleGFjdDpmYWxzZX1cIiBjbGFzcz1cInVpLW1lbnVpdGVtLWxpbmsgdWktY29ybmVyLWFsbFwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwieyd1aS1zdGF0ZS1kaXNhYmxlZCc6Y2hpbGQuZGlzYWJsZWR9XCIgW2F0dHIudGFiaW5kZXhdPVwiaXRlbS5leHBhbmRlZCA/IG51bGwgOiBjaGlsZC50YWJpbmRleCA/IGNoaWxkLnRhYmluZGV4IDogJy0xJ1wiIFthdHRyLmlkXT1cImNoaWxkLmlkXCIgcm9sZT1cInRyZWVpdGVtXCIgW2F0dHIuYXJpYS1leHBhbmRlZF09XCJjaGlsZC5leHBhbmRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwiaGFuZGxlQ2xpY2soJGV2ZW50LGNoaWxkKVwiIFthdHRyLnRhcmdldF09XCJjaGlsZC50YXJnZXRcIiBbYXR0ci50aXRsZV09XCJjaGlsZC50aXRsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBbZnJhZ21lbnRdPVwiY2hpbGQuZnJhZ21lbnRcIiBbcXVlcnlQYXJhbXNIYW5kbGluZ109XCJjaGlsZC5xdWVyeVBhcmFtc0hhbmRsaW5nXCIgW3ByZXNlcnZlRnJhZ21lbnRdPVwiY2hpbGQucHJlc2VydmVGcmFnbWVudFwiIFtza2lwTG9jYXRpb25DaGFuZ2VdPVwiY2hpbGQuc2tpcExvY2F0aW9uQ2hhbmdlXCIgW3JlcGxhY2VVcmxdPVwiY2hpbGQucmVwbGFjZVVybFwiIFtzdGF0ZV09XCJjaGlsZC5zdGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1wYW5lbG1lbnUtaWNvbiBwaSBwaS1md1wiIFtuZ0NsYXNzXT1cInsncGktY2FyZXQtcmlnaHQnOiFjaGlsZC5leHBhbmRlZCwncGktY2FyZXQtZG93bic6Y2hpbGQuZXhwYW5kZWR9XCIgKm5nSWY9XCJjaGlsZC5pdGVtc1wiPjwvc3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidWktbWVudWl0ZW0taWNvblwiIFtuZ0NsYXNzXT1cImNoaWxkLmljb25cIiAqbmdJZj1cImNoaWxkLmljb25cIj48L3NwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInVpLW1lbnVpdGVtLXRleHRcIj57e2NoaWxkLmxhYmVsfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgPHAtcGFuZWxNZW51U3ViIFtpdGVtXT1cImNoaWxkXCIgW2V4cGFuZGVkXT1cImNoaWxkLmV4cGFuZGVkXCIgW3RyYW5zaXRpb25PcHRpb25zXT1cInRyYW5zaXRpb25PcHRpb25zXCIgKm5nSWY9XCJjaGlsZC5pdGVtc1wiPjwvcC1wYW5lbE1lbnVTdWI+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICAgIDwvdWw+XG4gICAgYCxcbiAgICBhbmltYXRpb25zOiBbXG4gICAgICAgIHRyaWdnZXIoJ3N1Ym1lbnUnLCBbXG4gICAgICAgICAgICBzdGF0ZSgnaGlkZGVuJywgc3R5bGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogJzBweCdcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIHN0YXRlKCd2b2lkJywgc3R5bGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogJ3t7aGVpZ2h0fX0nXG4gICAgICAgICAgICB9KSwge3BhcmFtczoge2hlaWdodDogJzAnfX0pLFxuICAgICAgICAgICAgc3RhdGUoJ3Zpc2libGUnLCBzdHlsZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnKidcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3Zpc2libGUgPT4gaGlkZGVuJywgYW5pbWF0ZSgne3t0cmFuc2l0aW9uUGFyYW1zfX0nKSksXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCdoaWRkZW4gPT4gdmlzaWJsZScsIGFuaW1hdGUoJ3t7dHJhbnNpdGlvblBhcmFtc319JykpLFxuICAgICAgICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiBoaWRkZW4nLCBhbmltYXRlKCd7e3RyYW5zaXRpb25QYXJhbXN9fScpKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gdmlzaWJsZScsIGFuaW1hdGUoJ3t7dHJhbnNpdGlvblBhcmFtc319JykpXG4gICAgICAgIF0pXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYW5lbE1lbnVTdWIgZXh0ZW5kcyBCYXNlUGFuZWxNZW51SXRlbSB7XG4gICAgXG4gICAgQElucHV0KCkgaXRlbTogTWVudUl0ZW07XG4gICAgXG4gICAgQElucHV0KCkgZXhwYW5kZWQ6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSB0cmFuc2l0aW9uT3B0aW9uczogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgICAgICBzdXBlcihyZWYpO1xuICAgIH1cbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLXBhbmVsTWVudScsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW25nQ2xhc3NdPVwiJ3VpLXBhbmVsbWVudSB1aS13aWRnZXQnXCI+XG4gICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0Zvcj1cImxldCBpdGVtIG9mIG1vZGVsO2xldCBmPWZpcnN0O2xldCBsPWxhc3Q7XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLXBhbmVsbWVudS1wYW5lbFwiIFtuZ0NsYXNzXT1cInsndWktaGVscGVyLWhpZGRlbic6IGl0ZW0udmlzaWJsZSA9PT0gZmFsc2V9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgW25nQ2xhc3NdPVwieyd1aS13aWRnZXQgdWktcGFuZWxtZW51LWhlYWRlciB1aS1zdGF0ZS1kZWZhdWx0Jzp0cnVlLCd1aS1jb3JuZXItdG9wJzpmLCd1aS1jb3JuZXItYm90dG9tJzpsJiYhaXRlbS5leHBhbmRlZCxcbiAgICAgICAgICAgICAgICAgICAgJ3VpLXN0YXRlLWFjdGl2ZSc6aXRlbS5leHBhbmRlZCwndWktc3RhdGUtZGlzYWJsZWQnOml0ZW0uZGlzYWJsZWR9XCIgW2NsYXNzXT1cIml0ZW0uc3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cIml0ZW0uc3R5bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhICpuZ0lmPVwiIWl0ZW0ucm91dGVyTGlua1wiIFtocmVmXT1cIml0ZW0udXJsfHwnIydcIiAoY2xpY2spPVwiaGFuZGxlQ2xpY2soJGV2ZW50LGl0ZW0pXCIgW2F0dHIudGFiaW5kZXhdPVwiaXRlbS50YWJpbmRleCA/IGl0ZW0udGFiaW5kZXggOiAnMCdcIiBbYXR0ci5pZF09XCJpdGVtLmlkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyLnRhcmdldF09XCJpdGVtLnRhcmdldFwiIFthdHRyLnRpdGxlXT1cIml0ZW0udGl0bGVcIiBjbGFzcz1cInVpLXBhbmVsbWVudS1oZWFkZXItbGlua1wiIFthdHRyLmFyaWEtZXhwYW5kZWRdPVwiaXRlbS5leHBhbmRlZFwiIFthdHRyLmlkXT1cIml0ZW0uaWQgKyAnX2hlYWRlcidcIiBbYXR0ci5hcmlhLWNvbnRyb2xzXT1cIml0ZW0uaWQgKydfY29udGVudCdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiaXRlbS5pdGVtc1wiIGNsYXNzPVwidWktcGFuZWxtZW51LWljb24gcGkgcGktZndcIiBbbmdDbGFzc109XCJ7J3BpLWNoZXZyb24tcmlnaHQnOiFpdGVtLmV4cGFuZGVkLCdwaS1jaGV2cm9uLWRvd24nOml0ZW0uZXhwYW5kZWR9XCI+PC9zcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICA+PHNwYW4gY2xhc3M9XCJ1aS1tZW51aXRlbS1pY29uXCIgW25nQ2xhc3NdPVwiaXRlbS5pY29uXCIgKm5nSWY9XCJpdGVtLmljb25cIj48L3NwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInVpLW1lbnVpdGVtLXRleHRcIj57e2l0ZW0ubGFiZWx9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhICpuZ0lmPVwiaXRlbS5yb3V0ZXJMaW5rXCIgW3JvdXRlckxpbmtdPVwiaXRlbS5yb3V0ZXJMaW5rXCIgW3F1ZXJ5UGFyYW1zXT1cIml0ZW0ucXVlcnlQYXJhbXNcIiBbcm91dGVyTGlua0FjdGl2ZV09XCIndWktbWVudWl0ZW0tbGluay1hY3RpdmUnXCIgW3JvdXRlckxpbmtBY3RpdmVPcHRpb25zXT1cIml0ZW0ucm91dGVyTGlua0FjdGl2ZU9wdGlvbnN8fHtleGFjdDpmYWxzZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cImhhbmRsZUNsaWNrKCRldmVudCxpdGVtKVwiIFthdHRyLnRhcmdldF09XCJpdGVtLnRhcmdldFwiIFthdHRyLnRpdGxlXT1cIml0ZW0udGl0bGVcIiBjbGFzcz1cInVpLXBhbmVsbWVudS1oZWFkZXItbGlua1wiIFthdHRyLmlkXT1cIml0ZW0uaWRcIiBbYXR0ci50YWJpbmRleF09XCJpdGVtLnRhYmluZGV4ID8gaXRlbS50YWJpbmRleCA6ICcwJ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBbZnJhZ21lbnRdPVwiaXRlbS5mcmFnbWVudFwiIFtxdWVyeVBhcmFtc0hhbmRsaW5nXT1cIml0ZW0ucXVlcnlQYXJhbXNIYW5kbGluZ1wiIFtwcmVzZXJ2ZUZyYWdtZW50XT1cIml0ZW0ucHJlc2VydmVGcmFnbWVudFwiIFtza2lwTG9jYXRpb25DaGFuZ2VdPVwiaXRlbS5za2lwTG9jYXRpb25DaGFuZ2VcIiBbcmVwbGFjZVVybF09XCJpdGVtLnJlcGxhY2VVcmxcIiBbc3RhdGVdPVwiaXRlbS5zdGF0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCJpdGVtLml0ZW1zXCIgY2xhc3M9XCJ1aS1wYW5lbG1lbnUtaWNvbiBwaSBwaS1md1wiIFtuZ0NsYXNzXT1cInsncGktY2hldnJvbi1yaWdodCc6IWl0ZW0uZXhwYW5kZWQsJ3BpLWNoZXZyb24tZG93bic6aXRlbS5leHBhbmRlZH1cIj48L3NwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgID48c3BhbiBjbGFzcz1cInVpLW1lbnVpdGVtLWljb25cIiBbbmdDbGFzc109XCJpdGVtLmljb25cIiAqbmdJZj1cIml0ZW0uaWNvblwiPjwvc3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgPjxzcGFuIGNsYXNzPVwidWktbWVudWl0ZW0tdGV4dFwiPnt7aXRlbS5sYWJlbH19PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiAqbmdJZj1cIml0ZW0uaXRlbXNcIiBjbGFzcz1cInVpLXBhbmVsbWVudS1jb250ZW50LXdyYXBwZXJcIiBbQHJvb3RJdGVtXT1cIml0ZW0uZXhwYW5kZWQgPyB7dmFsdWU6ICd2aXNpYmxlJywgcGFyYW1zOiB7dHJhbnNpdGlvblBhcmFtczogYW5pbWF0aW5nID8gdHJhbnNpdGlvbk9wdGlvbnMgOiAnMG1zJywgaGVpZ2h0OiAnKid9fSA6IHt2YWx1ZTogJ2hpZGRlbicsIHBhcmFtczoge3RyYW5zaXRpb25QYXJhbXM6IHRyYW5zaXRpb25PcHRpb25zLCBoZWlnaHQ6ICcwJ319XCIgIChAcm9vdEl0ZW0uZG9uZSk9XCJvblRvZ2dsZURvbmUoKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwieyd1aS1wYW5lbG1lbnUtY29udGVudC13cmFwcGVyLW92ZXJmbG93bic6ICFpdGVtLmV4cGFuZGVkfHxhbmltYXRpbmd9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWktcGFuZWxtZW51LWNvbnRlbnQgdWktd2lkZ2V0LWNvbnRlbnRcIiByb2xlPVwicmVnaW9uXCIgW2F0dHIuaWRdPVwiaXRlbS5pZCArJ19jb250ZW50JyBcIiBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiaXRlbS5pZCArJ19oZWFkZXInXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAtcGFuZWxNZW51U3ViIFtpdGVtXT1cIml0ZW1cIiBbZXhwYW5kZWRdPVwidHJ1ZVwiIFt0cmFuc2l0aW9uT3B0aW9uc109XCJ0cmFuc2l0aW9uT3B0aW9uc1wiIGNsYXNzPVwidWktcGFuZWxtZW51LXJvb3Qtc3VibWVudVwiPjwvcC1wYW5lbE1lbnVTdWI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBhbmltYXRpb25zOiBbXG4gICAgICAgIHRyaWdnZXIoJ3Jvb3RJdGVtJywgW1xuICAgICAgICAgICAgc3RhdGUoJ2hpZGRlbicsIHN0eWxlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcwcHgnXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICBzdGF0ZSgndm9pZCcsIHN0eWxlKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICd7e2hlaWdodH19J1xuICAgICAgICAgICAgfSksIHtwYXJhbXM6IHtoZWlnaHQ6ICcwJ319KSxcbiAgICAgICAgICAgIHN0YXRlKCd2aXNpYmxlJywgc3R5bGUoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogJyonXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCd2aXNpYmxlID0+IGhpZGRlbicsIGFuaW1hdGUoJ3t7dHJhbnNpdGlvblBhcmFtc319JykpLFxuICAgICAgICAgICAgdHJhbnNpdGlvbignaGlkZGVuID0+IHZpc2libGUnLCBhbmltYXRlKCd7e3RyYW5zaXRpb25QYXJhbXN9fScpKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gaGlkZGVuJywgYW5pbWF0ZSgne3t0cmFuc2l0aW9uUGFyYW1zfX0nKSksXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCd2b2lkID0+IHZpc2libGUnLCBhbmltYXRlKCd7e3RyYW5zaXRpb25QYXJhbXN9fScpKVxuICAgICAgICBdKVxuICAgIF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIFBhbmVsTWVudSBleHRlbmRzIEJhc2VQYW5lbE1lbnVJdGVtIHtcbiAgICBcbiAgICBASW5wdXQoKSBtb2RlbDogTWVudUl0ZW1bXTtcblxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XG5cbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBtdWx0aXBsZTogYm9vbGVhbiA9IHRydWU7XG5cbiAgICBASW5wdXQoKSB0cmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJzQwMG1zIGN1YmljLWJlemllcigwLjg2LCAwLCAwLjA3LCAxKSc7XG4gICAgXG4gICAgcHVibGljIGFuaW1hdGluZzogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAgICAgc3VwZXIocmVmKTtcbiAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgY29sbGFwc2VBbGwoKSB7XG4gICAgXHRmb3IobGV0IGl0ZW0gb2YgdGhpcy5tb2RlbCkge1xuICAgIFx0XHRpZiAoaXRlbS5leHBhbmRlZCkge1xuICAgIFx0XHRcdGl0ZW0uZXhwYW5kZWQgPSBmYWxzZTtcbiAgICBcdFx0fVxuICAgIFx0fVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKGV2ZW50LCBpdGVtKSB7XG4gICAgXHRpZiAoIXRoaXMubXVsdGlwbGUpIHtcbiAgICAgICAgICAgIGZvcihsZXQgbW9kZWxJdGVtIG9mIHRoaXMubW9kZWwpIHtcbiAgICAgICAgXHRcdGlmIChpdGVtICE9PSBtb2RlbEl0ZW0gJiYgbW9kZWxJdGVtLmV4cGFuZGVkKSB7XG4gICAgICAgIFx0XHRcdG1vZGVsSXRlbS5leHBhbmRlZCA9IGZhbHNlO1xuICAgICAgICBcdFx0fVxuICAgICAgICBcdH1cbiAgICBcdH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgc3VwZXIuaGFuZGxlQ2xpY2soZXZlbnQsIGl0ZW0pO1xuICAgIH1cbiAgICBcbiAgICBvblRvZ2dsZURvbmUoKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgfVxuXG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxSb3V0ZXJNb2R1bGVdLFxuICAgIGV4cG9ydHM6IFtQYW5lbE1lbnUsUm91dGVyTW9kdWxlXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtQYW5lbE1lbnUsUGFuZWxNZW51U3ViXVxufSlcbmV4cG9ydCBjbGFzcyBQYW5lbE1lbnVNb2R1bGUgeyB9XG4iXX0=