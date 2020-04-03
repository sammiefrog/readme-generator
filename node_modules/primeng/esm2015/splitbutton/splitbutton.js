var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, OnDestroy, Input, Output, EventEmitter, Renderer2, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UniqueComponentId } from 'primeng/utils';
let SplitButton = class SplitButton {
    constructor(el, renderer, router, cd) {
        this.el = el;
        this.renderer = renderer;
        this.router = router;
        this.cd = cd;
        this.iconPos = 'left';
        this.onClick = new EventEmitter();
        this.onDropdownClick = new EventEmitter();
        this.showTransitionOptions = '225ms ease-out';
        this.hideTransitionOptions = '195ms ease-in';
        this.overlayVisible = false;
        this.ariaId = UniqueComponentId() + '_list';
    }
    onDefaultButtonClick(event) {
        this.onClick.emit(event);
    }
    itemClick(event, item) {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        if (!item.url) {
            event.preventDefault();
        }
        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }
        this.overlayVisible = false;
    }
    show() {
        this.overlayVisible = !this.overlayVisible;
    }
    onOverlayAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                this.overlay = event.element;
                this.appendOverlay();
                this.overlay.style.zIndex = String(++DomHandler.zindex);
                this.alignOverlay();
                this.bindDocumentClickListener();
                this.bindDocumentResizeListener();
                break;
            case 'void':
                this.onOverlayHide();
                break;
        }
    }
    onDropdownButtonClick(event) {
        this.onDropdownClick.emit(event);
        this.dropdownClick = true;
        this.show();
    }
    alignOverlay() {
        if (this.appendTo)
            DomHandler.absolutePosition(this.overlay, this.containerViewChild.nativeElement);
        else
            DomHandler.relativePosition(this.overlay, this.containerViewChild.nativeElement);
    }
    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                DomHandler.appendChild(this.overlay, this.appendTo);
            this.overlay.style.minWidth = DomHandler.getWidth(this.el.nativeElement.children[0]) + 'px';
        }
    }
    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }
    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            this.documentClickListener = this.renderer.listen('document', 'click', () => {
                if (this.dropdownClick) {
                    this.dropdownClick = false;
                }
                else {
                    this.overlayVisible = false;
                    this.unbindDocumentClickListener();
                    this.cd.markForCheck();
                }
            });
        }
    }
    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
    bindDocumentResizeListener() {
        this.documentResizeListener = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.documentResizeListener);
    }
    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    onWindowResize() {
        this.overlayVisible = false;
    }
    onOverlayHide() {
        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.overlay = null;
    }
    ngOnDestroy() {
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
};
SplitButton.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: Router },
    { type: ChangeDetectorRef }
];
__decorate([
    Input()
], SplitButton.prototype, "model", void 0);
__decorate([
    Input()
], SplitButton.prototype, "icon", void 0);
__decorate([
    Input()
], SplitButton.prototype, "iconPos", void 0);
__decorate([
    Input()
], SplitButton.prototype, "label", void 0);
__decorate([
    Output()
], SplitButton.prototype, "onClick", void 0);
__decorate([
    Output()
], SplitButton.prototype, "onDropdownClick", void 0);
__decorate([
    Input()
], SplitButton.prototype, "style", void 0);
__decorate([
    Input()
], SplitButton.prototype, "styleClass", void 0);
__decorate([
    Input()
], SplitButton.prototype, "menuStyle", void 0);
__decorate([
    Input()
], SplitButton.prototype, "menuStyleClass", void 0);
__decorate([
    Input()
], SplitButton.prototype, "disabled", void 0);
__decorate([
    Input()
], SplitButton.prototype, "tabindex", void 0);
__decorate([
    Input()
], SplitButton.prototype, "appendTo", void 0);
__decorate([
    Input()
], SplitButton.prototype, "dir", void 0);
__decorate([
    Input()
], SplitButton.prototype, "showTransitionOptions", void 0);
__decorate([
    Input()
], SplitButton.prototype, "hideTransitionOptions", void 0);
__decorate([
    ViewChild('container')
], SplitButton.prototype, "containerViewChild", void 0);
__decorate([
    ViewChild('defaultbtn')
], SplitButton.prototype, "buttonViewChild", void 0);
SplitButton = __decorate([
    Component({
        selector: 'p-splitButton',
        template: `
        <div #container [ngClass]="{'ui-splitbutton ui-buttonset ui-widget':true,'ui-state-disabled':disabled}" [ngStyle]="style" [class]="styleClass">
            <button #defaultbtn type="button" pButton [icon]="icon" [iconPos]="iconPos" [label]="label" [cornerStyleClass]="dir === 'rtl' ? 'ui-corner-right': 'ui-corner-left'" (click)="onDefaultButtonClick($event)" [disabled]="disabled" [attr.tabindex]="tabindex">
            </button><button type="button" pButton class="ui-splitbutton-menubutton" icon="pi pi-chevron-down" [cornerStyleClass]="dir === 'rtl' ? 'ui-corner-left': 'ui-corner-right'" (click)="onDropdownButtonClick($event)" [disabled]="disabled"></button>
            <div [attr.id]="ariaId + '_overlay'" #overlay [ngClass]="'ui-menu ui-menu-dynamic ui-widget ui-widget-content ui-corner-all ui-helper-clearfix ui-shadow'" *ngIf="overlayVisible"
                    [ngStyle]="menuStyle" [class]="menuStyleClass"
                    [@overlayAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}" (@overlayAnimation.start)="onOverlayAnimationStart($event)">
                <ul class="ui-menu-list ui-helper-reset" role="menu">
                    <ng-template ngFor let-item [ngForOf]="model">
                        <li *ngIf="item.separator" class="ui-menu-separator ui-widget-content" [ngClass]="{'ui-helper-hidden': item.visible === false}" role="separator">
                        <li class="ui-menuitem ui-widget ui-corner-all" role="menuitem" *ngIf="item.visible !== false && !item.separator" role="none">
                            <a *ngIf="!item.routerLink" [attr.href]="item.url" class="ui-menuitem-link ui-corner-all" [attr.target]="item.target" role="menuitem"
                                [ngClass]="{'ui-state-disabled':item.disabled}" (click)="itemClick($event, item)">
                                <span [ngClass]="'ui-menuitem-icon'" [class]="item.icon" *ngIf="item.icon"></span>
                                <span class="ui-menuitem-text">{{item.label}}</span>
                            </a>
                            <a *ngIf="item.routerLink" [routerLink]="item.routerLink" [queryParams]="item.queryParams"
                                class="ui-menuitem-link ui-corner-all" [attr.target]="item.target" [ngClass]="{'ui-state-disabled':item.disabled}" (click)="itemClick($event, item)">
                                <span [ngClass]="'ui-menuitem-icon'" [class]="item.icon" *ngIf="item.icon"></span>
                                <span class="ui-menuitem-text">{{item.label}}</span>
                            </a>
                        </li>
                    </ng-template>
                </ul>
            </div>
        </div>
    `,
        animations: [
            trigger('overlayAnimation', [
                state('void', style({
                    transform: 'translateY(5%)',
                    opacity: 0
                })),
                state('visible', style({
                    transform: 'translateY(0)',
                    opacity: 1
                })),
                transition('void => visible', animate('{{showTransitionParams}}')),
                transition('visible => void', animate('{{hideTransitionParams}}'))
            ])
        ],
        changeDetection: ChangeDetectionStrategy.Default
    })
], SplitButton);
export { SplitButton };
let SplitButtonModule = class SplitButtonModule {
};
SplitButtonModule = __decorate([
    NgModule({
        imports: [CommonModule, ButtonModule, RouterModule],
        exports: [SplitButton, ButtonModule, RouterModule],
        declarations: [SplitButton]
    })
], SplitButtonModule);
export { SplitButtonModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXRidXR0b24uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wcmltZW5nL3NwbGl0YnV0dG9uLyIsInNvdXJjZXMiOlsic3BsaXRidXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBQyxTQUFTLEVBQUMsaUJBQWlCLEVBQUMsU0FBUyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlKLE9BQU8sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxVQUFVLEVBQUMsT0FBTyxFQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBQzFGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXZDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQStDbEQsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztJQW9EcEIsWUFBbUIsRUFBYyxFQUFTLFFBQW1CLEVBQVMsTUFBYyxFQUFTLEVBQXFCO1FBQS9GLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBOUN6RyxZQUFPLEdBQVcsTUFBTSxDQUFDO1FBSXhCLFlBQU8sR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVoRCxvQkFBZSxHQUFzQixJQUFJLFlBQVksRUFB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QUMsWUFBWSxDQUFDO29EQUE2QjtBQXBDNUMsV0FBVztJQTdDdkIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQTBCVDtRQUNELFVBQVUsRUFBRTtZQUNSLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7b0JBQ2hCLFNBQVMsRUFBRSxnQkFBZ0I7b0JBQzNCLE9BQU8sRUFBRSxDQUFDO2lCQUNiLENBQUMsQ0FBQztnQkFDSCxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztvQkFDbkIsU0FBUyxFQUFFLGVBQWU7b0JBQzFCLE9BQU8sRUFBRSxDQUFDO2lCQUNiLENBQUMsQ0FBQztnQkFDSCxVQUFVLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7Z0JBQ2xFLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQzthQUNyRSxDQUFDO1NBQ0w7UUFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztLQUNuRCxDQUFDO0dBQ1csV0FBVyxDQW1MdkI7U0FuTFksV0FBVztBQTBMeEIsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBaUI7Q0FBSSxDQUFBO0FBQXJCLGlCQUFpQjtJQUw3QixRQUFRLENBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztRQUNqRCxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztRQUNoRCxZQUFZLEVBQUUsQ0FBQyxXQUFXLENBQUM7S0FDOUIsQ0FBQztHQUNXLGlCQUFpQixDQUFJO1NBQXJCLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsT25EZXN0cm95LElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsUmVuZGVyZXIyLENoYW5nZURldGVjdG9yUmVmLFZpZXdDaGlsZCxDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3RyaWdnZXIsc3RhdGUsc3R5bGUsdHJhbnNpdGlvbixhbmltYXRlLEFuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtEb21IYW5kbGVyfSBmcm9tICdwcmltZW5nL2RvbSc7XG5pbXBvcnQge01lbnVJdGVtfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge0J1dHRvbk1vZHVsZX0gZnJvbSAncHJpbWVuZy9idXR0b24nO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQge1JvdXRlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFVuaXF1ZUNvbXBvbmVudElkIH0gZnJvbSAncHJpbWVuZy91dGlscyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAncC1zcGxpdEJ1dHRvbicsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiAjY29udGFpbmVyIFtuZ0NsYXNzXT1cInsndWktc3BsaXRidXR0b24gdWktYnV0dG9uc2V0IHVpLXdpZGdldCc6dHJ1ZSwndWktc3RhdGUtZGlzYWJsZWQnOmRpc2FibGVkfVwiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIj5cbiAgICAgICAgICAgIDxidXR0b24gI2RlZmF1bHRidG4gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gW2ljb25dPVwiaWNvblwiIFtpY29uUG9zXT1cImljb25Qb3NcIiBbbGFiZWxdPVwibGFiZWxcIiBbY29ybmVyU3R5bGVDbGFzc109XCJkaXIgPT09ICdydGwnID8gJ3VpLWNvcm5lci1yaWdodCc6ICd1aS1jb3JuZXItbGVmdCdcIiAoY2xpY2spPVwib25EZWZhdWx0QnV0dG9uQ2xpY2soJGV2ZW50KVwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIFthdHRyLnRhYmluZGV4XT1cInRhYmluZGV4XCI+XG4gICAgICAgICAgICA8L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIGNsYXNzPVwidWktc3BsaXRidXR0b24tbWVudWJ1dHRvblwiIGljb249XCJwaSBwaS1jaGV2cm9uLWRvd25cIiBbY29ybmVyU3R5bGVDbGFzc109XCJkaXIgPT09ICdydGwnID8gJ3VpLWNvcm5lci1sZWZ0JzogJ3VpLWNvcm5lci1yaWdodCdcIiAoY2xpY2spPVwib25Ecm9wZG93bkJ1dHRvbkNsaWNrKCRldmVudClcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIj48L2J1dHRvbj5cbiAgICAgICAgICAgIDxkaXYgW2F0dHIuaWRdPVwiYXJpYUlkICsgJ19vdmVybGF5J1wiICNvdmVybGF5IFtuZ0NsYXNzXT1cIid1aS1tZW51IHVpLW1lbnUtZHluYW1pYyB1aS13aWRnZXQgdWktd2lkZ2V0LWNvbnRlbnQgdWktY29ybmVyLWFsbCB1aS1oZWxwZXItY2xlYXJmaXggdWktc2hhZG93J1wiICpuZ0lmPVwib3ZlcmxheVZpc2libGVcIlxuICAgICAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJtZW51U3R5bGVcIiBbY2xhc3NdPVwibWVudVN0eWxlQ2xhc3NcIlxuICAgICAgICAgICAgICAgICAgICBbQG92ZXJsYXlBbmltYXRpb25dPVwie3ZhbHVlOiAndmlzaWJsZScsIHBhcmFtczoge3Nob3dUcmFuc2l0aW9uUGFyYW1zOiBzaG93VHJhbnNpdGlvbk9wdGlvbnMsIGhpZGVUcmFuc2l0aW9uUGFyYW1zOiBoaWRlVHJhbnNpdGlvbk9wdGlvbnN9fVwiIChAb3ZlcmxheUFuaW1hdGlvbi5zdGFydCk9XCJvbk92ZXJsYXlBbmltYXRpb25TdGFydCgkZXZlbnQpXCI+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwidWktbWVudS1saXN0IHVpLWhlbHBlci1yZXNldFwiIHJvbGU9XCJtZW51XCI+XG4gICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtaXRlbSBbbmdGb3JPZl09XCJtb2RlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpICpuZ0lmPVwiaXRlbS5zZXBhcmF0b3JcIiBjbGFzcz1cInVpLW1lbnUtc2VwYXJhdG9yIHVpLXdpZGdldC1jb250ZW50XCIgW25nQ2xhc3NdPVwieyd1aS1oZWxwZXItaGlkZGVuJzogaXRlbS52aXNpYmxlID09PSBmYWxzZX1cIiByb2xlPVwic2VwYXJhdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ1aS1tZW51aXRlbSB1aS13aWRnZXQgdWktY29ybmVyLWFsbFwiIHJvbGU9XCJtZW51aXRlbVwiICpuZ0lmPVwiaXRlbS52aXNpYmxlICE9PSBmYWxzZSAmJiAhaXRlbS5zZXBhcmF0b3JcIiByb2xlPVwibm9uZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhICpuZ0lmPVwiIWl0ZW0ucm91dGVyTGlua1wiIFthdHRyLmhyZWZdPVwiaXRlbS51cmxcIiBjbGFzcz1cInVpLW1lbnVpdGVtLWxpbmsgdWktY29ybmVyLWFsbFwiIFthdHRyLnRhcmdldF09XCJpdGVtLnRhcmdldFwiIHJvbGU9XCJtZW51aXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktc3RhdGUtZGlzYWJsZWQnOml0ZW0uZGlzYWJsZWR9XCIgKGNsaWNrKT1cIml0ZW1DbGljaygkZXZlbnQsIGl0ZW0pXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cIid1aS1tZW51aXRlbS1pY29uJ1wiIFtjbGFzc109XCJpdGVtLmljb25cIiAqbmdJZj1cIml0ZW0uaWNvblwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1tZW51aXRlbS10ZXh0XCI+e3tpdGVtLmxhYmVsfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhICpuZ0lmPVwiaXRlbS5yb3V0ZXJMaW5rXCIgW3JvdXRlckxpbmtdPVwiaXRlbS5yb3V0ZXJMaW5rXCIgW3F1ZXJ5UGFyYW1zXT1cIml0ZW0ucXVlcnlQYXJhbXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInVpLW1lbnVpdGVtLWxpbmsgdWktY29ybmVyLWFsbFwiIFthdHRyLnRhcmdldF09XCJpdGVtLnRhcmdldFwiIFtuZ0NsYXNzXT1cInsndWktc3RhdGUtZGlzYWJsZWQnOml0ZW0uZGlzYWJsZWR9XCIgKGNsaWNrKT1cIml0ZW1DbGljaygkZXZlbnQsIGl0ZW0pXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cIid1aS1tZW51aXRlbS1pY29uJ1wiIFtjbGFzc109XCJpdGVtLmljb25cIiAqbmdJZj1cIml0ZW0uaWNvblwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1tZW51aXRlbS10ZXh0XCI+e3tpdGVtLmxhYmVsfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYW5pbWF0aW9uczogW1xuICAgICAgICB0cmlnZ2VyKCdvdmVybGF5QW5pbWF0aW9uJywgW1xuICAgICAgICAgICAgc3RhdGUoJ3ZvaWQnLCBzdHlsZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSg1JSknLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIHN0YXRlKCd2aXNpYmxlJywgc3R5bGUoe1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoMCknLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gdmlzaWJsZScsIGFuaW1hdGUoJ3t7c2hvd1RyYW5zaXRpb25QYXJhbXN9fScpKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3Zpc2libGUgPT4gdm9pZCcsIGFuaW1hdGUoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScpKVxuICAgICAgICBdKVxuICAgIF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIFNwbGl0QnV0dG9uIGltcGxlbWVudHMgT25EZXN0cm95IHtcblxuICAgIEBJbnB1dCgpIG1vZGVsOiBNZW51SXRlbVtdO1xuXG4gICAgQElucHV0KCkgaWNvbjogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgaWNvblBvczogc3RyaW5nID0gJ2xlZnQnO1xuICAgICAgICBcbiAgICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xuICAgIFxuICAgIEBPdXRwdXQoKSBvbkNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBAT3V0cHV0KCkgb25Ecm9wZG93bkNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xuICAgIFxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcbiAgICBcbiAgICBASW5wdXQoKSBtZW51U3R5bGU6IGFueTtcbiAgICBcbiAgICBASW5wdXQoKSBtZW51U3R5bGVDbGFzczogc3RyaW5nO1xuICAgIFxuICAgIEBJbnB1dCgpIGRpc2FibGVkOiBib29sZWFuO1xuXG4gICAgQElucHV0KCkgdGFiaW5kZXg6IG51bWJlcjtcbiAgICBcbiAgICBASW5wdXQoKSBhcHBlbmRUbzogYW55O1xuICAgIFxuICAgIEBJbnB1dCgpIGRpcjogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgc2hvd1RyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMjI1bXMgZWFzZS1vdXQnO1xuXG4gICAgQElucHV0KCkgaGlkZVRyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMTk1bXMgZWFzZS1pbic7XG5cbiAgICBAVmlld0NoaWxkKCdjb250YWluZXInKSBjb250YWluZXJWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XG4gICAgXG4gICAgQFZpZXdDaGlsZCgnZGVmYXVsdGJ0bicpIGJ1dHRvblZpZXdDaGlsZDogRWxlbWVudFJlZjtcblxuICAgIG92ZXJsYXk6IEhUTUxEaXZFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICBwdWJsaWMgb3ZlcmxheVZpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBcbiAgICBwdWJsaWMgZG9jdW1lbnRDbGlja0xpc3RlbmVyOiBhbnk7XG4gICAgXG4gICAgcHVibGljIGRyb3Bkb3duQ2xpY2s6IGJvb2xlYW47XG4gICAgXG4gICAgcHVibGljIHNob3duOiBib29sZWFuO1xuXG4gICAgYXJpYUlkOiBzdHJpbmc7XG5cbiAgICBkb2N1bWVudFJlc2l6ZUxpc3RlbmVyOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLCBwdWJsaWMgcm91dGVyOiBSb3V0ZXIsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgICAgICAgdGhpcy5hcmlhSWQgPSBVbmlxdWVDb21wb25lbnRJZCgpICsgJ19saXN0JztcbiAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgb25EZWZhdWx0QnV0dG9uQ2xpY2soZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMub25DbGljay5lbWl0KGV2ZW50KTtcbiAgICB9XG4gICAgXG4gICAgaXRlbUNsaWNrKGV2ZW50OiBFdmVudCwgaXRlbTogTWVudUl0ZW0pwqB7XG4gICAgICAgIGlmIChpdGVtLmRpc2FibGVkKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIWl0ZW0udXJsKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoaXRlbS5jb21tYW5kKSB7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpdGVtLmNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIFxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSAhdGhpcy5vdmVybGF5VmlzaWJsZTtcbiAgICB9XG5cbiAgICBvbk92ZXJsYXlBbmltYXRpb25TdGFydChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcbiAgICAgICAgc3dpdGNoIChldmVudC50b1N0YXRlKSB7XG4gICAgICAgICAgICBjYXNlICd2aXNpYmxlJzpcbiAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXkgPSBldmVudC5lbGVtZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kT3ZlcmxheSgpO1xuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheS5zdHlsZS56SW5kZXggPSBTdHJpbmcoKytEb21IYW5kbGVyLnppbmRleCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGlnbk92ZXJsYXkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmREb2N1bWVudFJlc2l6ZUxpc3RlbmVyKCk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlIaWRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICAgICAgXG4gICAgb25Ecm9wZG93bkJ1dHRvbkNsaWNrKGV2ZW50OiBFdmVudCkge1xuICAgICAgICB0aGlzLm9uRHJvcGRvd25DbGljay5lbWl0KGV2ZW50KTtcbiAgICAgICAgdGhpcy5kcm9wZG93bkNsaWNrID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgfVxuXG4gICAgYWxpZ25PdmVybGF5KCkge1xuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbylcbiAgICAgICAgICAgIERvbUhhbmRsZXIuYWJzb2x1dGVQb3NpdGlvbih0aGlzLm92ZXJsYXksIHRoaXMuY29udGFpbmVyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBEb21IYW5kbGVyLnJlbGF0aXZlUG9zaXRpb24odGhpcy5vdmVybGF5LCB0aGlzLmNvbnRhaW5lclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KTtcbiAgICB9XG5cbiAgICBhcHBlbmRPdmVybGF5KCkge1xuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBwZW5kVG8gPT09ICdib2R5JylcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgRG9tSGFuZGxlci5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXksIHRoaXMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkuc3R5bGUubWluV2lkdGggPSBEb21IYW5kbGVyLmdldFdpZHRoKHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXSkgKyAncHgnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdG9yZU92ZXJsYXlBcHBlbmQoKSB7XG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkgJiYgdGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3RlbignZG9jdW1lbnQnLCAnY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJvcGRvd25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyb3Bkb3duQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB1bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBiaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpIHtcbiAgICAgICAgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyID0gdGhpcy5vbldpbmRvd1Jlc2l6ZS5iaW5kKHRoaXMpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyKTtcbiAgICB9XG4gICAgXG4gICAgdW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcikge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25XaW5kb3dSZXNpemUoKSB7XG4gICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBvbk92ZXJsYXlIaWRlKCkge1xuICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKTtcbiAgICAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcbiAgICB9XG4gICAgICAgICBcbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5yZXN0b3JlT3ZlcmxheUFwcGVuZCgpO1xuICAgICAgICB0aGlzLm9uT3ZlcmxheUhpZGUoKTtcbiAgICB9XG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxCdXR0b25Nb2R1bGUsUm91dGVyTW9kdWxlXSxcbiAgICBleHBvcnRzOiBbU3BsaXRCdXR0b24sQnV0dG9uTW9kdWxlLFJvdXRlck1vZHVsZV0sXG4gICAgZGVjbGFyYXRpb25zOiBbU3BsaXRCdXR0b25dXG59KVxuZXhwb3J0IGNsYXNzIFNwbGl0QnV0dG9uTW9kdWxlIHsgfVxuIl19