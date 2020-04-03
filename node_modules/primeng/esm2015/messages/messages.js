var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { NgModule, Component, OnInit, OnDestroy, Input, Output, EventEmitter, Optional, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MessageService } from 'primeng/api';
let Messages = class Messages {
    constructor(messageService, el) {
        this.messageService = messageService;
        this.el = el;
        this.closable = true;
        this.enableService = true;
        this.escape = true;
        this.showTransitionOptions = '300ms ease-out';
        this.hideTransitionOptions = '250ms ease-in';
        this.valueChange = new EventEmitter();
    }
    ngOnInit() {
        if (this.messageService && this.enableService) {
            this.messageSubscription = this.messageService.messageObserver.subscribe((messages) => {
                if (messages) {
                    if (messages instanceof Array) {
                        let filteredMessages = messages.filter(m => this.key === m.key);
                        this.value = this.value ? [...this.value, ...filteredMessages] : [...filteredMessages];
                    }
                    else if (this.key === messages.key) {
                        this.value = this.value ? [...this.value, ...[messages]] : [messages];
                    }
                }
            });
            this.clearSubscription = this.messageService.clearObserver.subscribe(key => {
                if (key) {
                    if (this.key === key) {
                        this.value = null;
                    }
                }
                else {
                    this.value = null;
                }
            });
        }
    }
    hasMessages() {
        let parentEl = this.el.nativeElement.parentElement;
        if (parentEl && parentEl.offsetParent) {
            return this.value && this.value.length > 0;
        }
        return false;
    }
    getSeverityClass() {
        const msg = this.value[0];
        if (msg) {
            const severities = ['info', 'warn', 'error', 'success'];
            const severity = severities.find(item => item === msg.severity);
            return severity && `ui-messages-${severity}`;
        }
        return null;
    }
    clear(event) {
        this.value = [];
        this.valueChange.emit(this.value);
        event.preventDefault();
    }
    get icon() {
        let icon = null;
        if (this.hasMessages()) {
            let msg = this.value[0];
            switch (msg.severity) {
                case 'success':
                    icon = 'pi-check';
                    break;
                case 'info':
                    icon = 'pi-info-circle';
                    break;
                case 'error':
                    icon = 'pi-times';
                    break;
                case 'warn':
                    icon = 'pi-exclamation-triangle';
                    break;
                default:
                    icon = 'pi-info-circle';
                    break;
            }
        }
        return icon;
    }
    ngOnDestroy() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        if (this.clearSubscription) {
            this.clearSubscription.unsubscribe();
        }
    }
};
Messages.ctorParameters = () => [
    { type: MessageService, decorators: [{ type: Optional }] },
    { type: ElementRef }
];
__decorate([
    Input()
], Messages.prototype, "value", void 0);
__decorate([
    Input()
], Messages.prototype, "closable", void 0);
__decorate([
    Input()
], Messages.prototype, "style", void 0);
__decorate([
    Input()
], Messages.prototype, "styleClass", void 0);
__decorate([
    Input()
], Messages.prototype, "enableService", void 0);
__decorate([
    Input()
], Messages.prototype, "key", void 0);
__decorate([
    Input()
], Messages.prototype, "escape", void 0);
__decorate([
    Input()
], Messages.prototype, "showTransitionOptions", void 0);
__decorate([
    Input()
], Messages.prototype, "hideTransitionOptions", void 0);
__decorate([
    Output()
], Messages.prototype, "valueChange", void 0);
Messages = __decorate([
    Component({
        selector: 'p-messages',
        template: `
        <div *ngIf="hasMessages()" class="ui-messages ui-widget ui-corner-all"
                    [ngClass]="getSeverityClass()" role="alert" [ngStyle]="style" [class]="styleClass"
                    [@messageAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}">
            <a tabindex="0" class="ui-messages-close" (click)="clear($event)" (keydown.enter)="clear($event)" *ngIf="closable">
                <i class="pi pi-times"></i>
            </a>
            <span class="ui-messages-icon pi" [ngClass]="icon"></span>
            <ul>
                <li *ngFor="let msg of value">
                    <div *ngIf="!escape; else escapeOut">
                        <span *ngIf="msg.summary" class="ui-messages-summary" [innerHTML]="msg.summary"></span>
                        <span *ngIf="msg.detail" class="ui-messages-detail" [innerHTML]="msg.detail"></span>
                    </div>
                    <ng-template #escapeOut>
                        <span *ngIf="msg.summary" class="ui-messages-summary">{{msg.summary}}</span>
                        <span *ngIf="msg.detail" class="ui-messages-detail">{{msg.detail}}</span>
                    </ng-template>
                </li>
            </ul>
        </div>
    `,
        animations: [
            trigger('messageAnimation', [
                state('visible', style({
                    transform: 'translateY(0)',
                    opacity: 1
                })),
                transition('void => *', [
                    style({ transform: 'translateY(-25%)', opacity: 0 }),
                    animate('{{showTransitionParams}}')
                ]),
                transition('* => void', [
                    animate(('{{hideTransitionParams}}'), style({
                        opacity: 0,
                        transform: 'translateY(-25%)'
                    }))
                ])
            ])
        ],
        changeDetection: ChangeDetectionStrategy.Default
    }),
    __param(0, Optional())
], Messages);
export { Messages };
let MessagesModule = class MessagesModule {
};
MessagesModule = __decorate([
    NgModule({
        imports: [CommonModule],
        exports: [Messages],
        declarations: [Messages]
    })
], MessagesModule);
export { MessagesModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wcmltZW5nL21lc3NhZ2VzLyIsInNvdXJjZXMiOlsibWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsTUFBTSxFQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBQyxRQUFRLEVBQUMsVUFBVSxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3hJLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRTNFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxhQUFhLENBQUM7QUErQzNDLElBQWEsUUFBUSxHQUFyQixNQUFhLFFBQVE7SUEwQmpCLFlBQStCLGNBQThCLEVBQVMsRUFBYztRQUFyRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBdEIzRSxhQUFRLEdBQVksSUFBSSxDQUFDO1FBTXpCLGtCQUFhLEdBQVksSUFBSSxDQUFDO1FBSTlCLFdBQU0sR0FBWSxJQUFJLENBQUM7UUFFdkIsMEJBQXFCLEdBQVcsZ0JBQWdCLENBQUM7UUFFakQsMEJBQXFCLEdBQVcsZUFBZSxDQUFDO1FBRS9DLGdCQUFXLEdBQTRCLElBQUksWUFBWSxFQUFhLENBQUM7SUFNUSxDQUFDO0lBRXhGLFFBQVE7UUFDSixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUMzQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUU7Z0JBQ3ZGLElBQUksUUFBUSxFQUFF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QUFFLENBQUM7aUJBQ2IsQ0FBQyxDQUFDO2dCQUNILFVBQVUsQ0FBQyxXQUFXLEVBQUU7b0JBQ3BCLEtBQUssQ0FBQyxFQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFDLENBQUM7b0JBQ2xELE9BQU8sQ0FBQywwQkFBMEIsQ0FBQztpQkFDdEMsQ0FBQztnQkFDRixVQUFVLENBQUMsV0FBVyxFQUFFO29CQUNwQixPQUFPLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLEtBQUssQ0FBQzt3QkFDeEMsT0FBTyxFQUFFLENBQUM7d0JBQ1YsU0FBUyxFQUFFLGtCQUFrQjtxQkFDaEMsQ0FBQyxDQUFDO2lCQUNOLENBQUM7YUFDTCxDQUFDO1NBQ0w7UUFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztLQUNuRCxDQUFDO0lBMkJlLFdBQUEsUUFBUSxFQUFFLENBQUE7R0ExQmQsUUFBUSxDQTBIcEI7U0ExSFksUUFBUTtBQWlJckIsSUFBYSxjQUFjLEdBQTNCLE1BQWEsY0FBYztDQUFJLENBQUE7QUFBbEIsY0FBYztJQUwxQixRQUFRLENBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdkIsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO1FBQ25CLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQztLQUMzQixDQUFDO0dBQ1csY0FBYyxDQUFJO1NBQWxCLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLENvbXBvbmVudCxPbkluaXQsT25EZXN0cm95LElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsT3B0aW9uYWwsRWxlbWVudFJlZixDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7dHJpZ2dlcixzdGF0ZSxzdHlsZSx0cmFuc2l0aW9uLGFuaW1hdGV9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuaW1wb3J0IHtNZXNzYWdlfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge01lc3NhZ2VTZXJ2aWNlfSBmcm9tICdwcmltZW5nL2FwaSc7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAncC1tZXNzYWdlcycsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiAqbmdJZj1cImhhc01lc3NhZ2VzKClcIiBjbGFzcz1cInVpLW1lc3NhZ2VzIHVpLXdpZGdldCB1aS1jb3JuZXItYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwiZ2V0U2V2ZXJpdHlDbGFzcygpXCIgcm9sZT1cImFsZXJ0XCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiXG4gICAgICAgICAgICAgICAgICAgIFtAbWVzc2FnZUFuaW1hdGlvbl09XCJ7dmFsdWU6ICd2aXNpYmxlJywgcGFyYW1zOiB7c2hvd1RyYW5zaXRpb25QYXJhbXM6IHNob3dUcmFuc2l0aW9uT3B0aW9ucywgaGlkZVRyYW5zaXRpb25QYXJhbXM6IGhpZGVUcmFuc2l0aW9uT3B0aW9uc319XCI+XG4gICAgICAgICAgICA8YSB0YWJpbmRleD1cIjBcIiBjbGFzcz1cInVpLW1lc3NhZ2VzLWNsb3NlXCIgKGNsaWNrKT1cImNsZWFyKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJjbGVhcigkZXZlbnQpXCIgKm5nSWY9XCJjbG9zYWJsZVwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwicGkgcGktdGltZXNcIj48L2k+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInVpLW1lc3NhZ2VzLWljb24gcGlcIiBbbmdDbGFzc109XCJpY29uXCI+PC9zcGFuPlxuICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgIDxsaSAqbmdGb3I9XCJsZXQgbXNnIG9mIHZhbHVlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgKm5nSWY9XCIhZXNjYXBlOyBlbHNlIGVzY2FwZU91dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCJtc2cuc3VtbWFyeVwiIGNsYXNzPVwidWktbWVzc2FnZXMtc3VtbWFyeVwiIFtpbm5lckhUTUxdPVwibXNnLnN1bW1hcnlcIj48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiAqbmdJZj1cIm1zZy5kZXRhaWxcIiBjbGFzcz1cInVpLW1lc3NhZ2VzLWRldGFpbFwiIFtpbm5lckhUTUxdPVwibXNnLmRldGFpbFwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSAjZXNjYXBlT3V0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCJtc2cuc3VtbWFyeVwiIGNsYXNzPVwidWktbWVzc2FnZXMtc3VtbWFyeVwiPnt7bXNnLnN1bW1hcnl9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwibXNnLmRldGFpbFwiIGNsYXNzPVwidWktbWVzc2FnZXMtZGV0YWlsXCI+e3ttc2cuZGV0YWlsfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgYW5pbWF0aW9uczogW1xuICAgICAgICB0cmlnZ2VyKCdtZXNzYWdlQW5pbWF0aW9uJywgW1xuICAgICAgICAgICAgc3RhdGUoJ3Zpc2libGUnLCBzdHlsZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgwKScsXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiAqJywgW1xuICAgICAgICAgICAgICAgIHN0eWxlKHt0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC0yNSUpJywgb3BhY2l0eTogMH0pLFxuICAgICAgICAgICAgICAgIGFuaW1hdGUoJ3t7c2hvd1RyYW5zaXRpb25QYXJhbXN9fScpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJyogPT4gdm9pZCcsIFtcbiAgICAgICAgICAgICAgICBhbmltYXRlKCgne3toaWRlVHJhbnNpdGlvblBhcmFtc319JyksIHN0eWxlKHtcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtMjUlKSdcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgXSxcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHRcbn0pXG5leHBvcnQgY2xhc3MgTWVzc2FnZXMgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgICBASW5wdXQoKSB2YWx1ZTogTWVzc2FnZVtdO1xuXG4gICAgQElucHV0KCkgY2xvc2FibGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcblxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcblxuICAgIEBJbnB1dCgpIGVuYWJsZVNlcnZpY2U6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkga2V5OiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBlc2NhcGU6IGJvb2xlYW4gPSB0cnVlO1xuXG4gICAgQElucHV0KCkgc2hvd1RyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMzAwbXMgZWFzZS1vdXQnO1xuXG4gICAgQElucHV0KCkgaGlkZVRyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMjUwbXMgZWFzZS1pbic7XG5cbiAgICBAT3V0cHV0KCkgdmFsdWVDaGFuZ2U6IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+ID0gbmV3IEV2ZW50RW1pdHRlcjxNZXNzYWdlW10+KCk7XG5cbiAgICBtZXNzYWdlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgICBjbGVhclN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xuXG4gICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHVibGljIG1lc3NhZ2VTZXJ2aWNlOiBNZXNzYWdlU2VydmljZSwgcHVibGljIGVsOiBFbGVtZW50UmVmKSB7fVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VTZXJ2aWNlICYmIHRoaXMuZW5hYmxlU2VydmljZSkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlU3Vic2NyaXB0aW9uID0gdGhpcy5tZXNzYWdlU2VydmljZS5tZXNzYWdlT2JzZXJ2ZXIuc3Vic2NyaWJlKChtZXNzYWdlczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlcyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlsdGVyZWRNZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihtID0+IHRoaXMua2V5ID09PSBtLmtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IFsuLi50aGlzLnZhbHVlLCAuLi5maWx0ZXJlZE1lc3NhZ2VzXSA6IFsuLi5maWx0ZXJlZE1lc3NhZ2VzXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLmtleSA9PT0gbWVzc2FnZXMua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IFsuLi50aGlzLnZhbHVlLCAuLi5bbWVzc2FnZXNdXSA6IFttZXNzYWdlc107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbiA9IHRoaXMubWVzc2FnZVNlcnZpY2UuY2xlYXJPYnNlcnZlci5zdWJzY3JpYmUoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleSA9PT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYXNNZXNzYWdlcygpIHtcbiAgICAgICAgbGV0IHBhcmVudEVsID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmIChwYXJlbnRFbCAmJiBwYXJlbnRFbC5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlICYmIHRoaXMudmFsdWUubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRTZXZlcml0eUNsYXNzKCkge1xuICAgICAgICBjb25zdCBtc2cgPSB0aGlzLnZhbHVlWzBdO1xuICAgICAgICBpZiAobXNnKSB7XG4gICAgICAgICAgICBjb25zdCBzZXZlcml0aWVzID0gWydpbmZvJywgJ3dhcm4nLCAnZXJyb3InLCAnc3VjY2VzcyddO1xuICAgICAgICAgICAgY29uc3Qgc2V2ZXJpdHkgPSBzZXZlcml0aWVzLmZpbmQoaXRlbSA9PiBpdGVtID09PSBtc2cuc2V2ZXJpdHkpO1xuXG4gICAgICAgICAgICByZXR1cm4gc2V2ZXJpdHkgJiYgYHVpLW1lc3NhZ2VzLSR7c2V2ZXJpdHl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNsZWFyKGV2ZW50KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBbXTtcbiAgICAgICAgdGhpcy52YWx1ZUNoYW5nZS5lbWl0KHRoaXMudmFsdWUpO1xuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgZ2V0IGljb24oKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IGljb246IHN0cmluZyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmhhc01lc3NhZ2VzKCkpIHtcbiAgICAgICAgICAgIGxldCBtc2cgPSB0aGlzLnZhbHVlWzBdO1xuICAgICAgICAgICAgc3dpdGNoKG1zZy5zZXZlcml0eSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICAgICAgICAgICAgICBpY29uID0gJ3BpLWNoZWNrJztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgICAgICBpY29uID0gJ3BpLWluZm8tY2lyY2xlJztcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgaWNvbiA9ICdwaS10aW1lcyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgaWNvbiA9ICdwaS1leGNsYW1hdGlvbi10cmlhbmdsZSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpY29uID0gJ3BpLWluZm8tY2lyY2xlJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpY29uO1xuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5tZXNzYWdlU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNsZWFyU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gICAgZXhwb3J0czogW01lc3NhZ2VzXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtNZXNzYWdlc11cbn0pXG5leHBvcnQgY2xhc3MgTWVzc2FnZXNNb2R1bGUgeyB9XG4iXX0=