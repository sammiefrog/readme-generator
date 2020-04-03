var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Directive, Component, ElementRef, EventEmitter, AfterViewInit, Output, OnDestroy, Input, ChangeDetectionStrategy } from '@angular/core';
import { DomHandler } from 'primeng/dom';
import { CommonModule } from '@angular/common';
let ButtonDirective = class ButtonDirective {
    constructor(el) {
        this.el = el;
        this.iconPos = 'left';
        this.cornerStyleClass = 'ui-corner-all';
    }
    ngAfterViewInit() {
        DomHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass());
        if (this.icon) {
            let iconElement = document.createElement("span");
            iconElement.setAttribute("aria-hidden", "true");
            let iconPosClass = (this.iconPos == 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            iconElement.className = iconPosClass + ' ui-clickable ' + this.icon;
            this.el.nativeElement.appendChild(iconElement);
        }
        let labelElement = document.createElement("span");
        if (this.icon && !this.label) {
            labelElement.setAttribute('aria-hidden', 'true');
        }
        labelElement.className = 'ui-button-text ui-clickable';
        labelElement.appendChild(document.createTextNode(this.label || 'ui-btn'));
        this.el.nativeElement.appendChild(labelElement);
        this.initialized = true;
    }
    getStyleClass() {
        let styleClass = 'ui-button ui-widget ui-state-default ' + this.cornerStyleClass;
        if (this.icon) {
            if (this.label != null && this.label != undefined) {
                if (this.iconPos == 'left')
                    styleClass = styleClass + ' ui-button-text-icon-left';
                else
                    styleClass = styleClass + ' ui-button-text-icon-right';
            }
            else {
                styleClass = styleClass + ' ui-button-icon-only';
            }
        }
        else {
            if (this.label) {
                styleClass = styleClass + ' ui-button-text-only';
            }
            else {
                styleClass = styleClass + ' ui-button-text-empty';
            }
        }
        return styleClass;
    }
    get label() {
        return this._label;
    }
    set label(val) {
        this._label = val;
        if (this.initialized) {
            DomHandler.findSingle(this.el.nativeElement, '.ui-button-text').textContent = this._label;
            if (!this.icon) {
                if (this._label) {
                    DomHandler.removeClass(this.el.nativeElement, 'ui-button-text-empty');
                    DomHandler.addClass(this.el.nativeElement, 'ui-button-text-only');
                }
                else {
                    DomHandler.addClass(this.el.nativeElement, 'ui-button-text-empty');
                    DomHandler.removeClass(this.el.nativeElement, 'ui-button-text-only');
                }
            }
        }
    }
    get icon() {
        return this._icon;
    }
    set icon(val) {
        this._icon = val;
        if (this.initialized) {
            let iconPosClass = (this.iconPos == 'right') ? 'ui-button-icon-right' : 'ui-button-icon-left';
            DomHandler.findSingle(this.el.nativeElement, '.ui-clickable').className =
                iconPosClass + ' ui-clickable ' + this.icon;
        }
    }
    ngOnDestroy() {
        while (this.el.nativeElement.hasChildNodes()) {
            this.el.nativeElement.removeChild(this.el.nativeElement.lastChild);
        }
        this.initialized = false;
    }
};
ButtonDirective.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], ButtonDirective.prototype, "iconPos", void 0);
__decorate([
    Input()
], ButtonDirective.prototype, "cornerStyleClass", void 0);
__decorate([
    Input()
], ButtonDirective.prototype, "label", null);
__decorate([
    Input()
], ButtonDirective.prototype, "icon", null);
ButtonDirective = __decorate([
    Directive({
        selector: '[pButton]'
    })
], ButtonDirective);
export { ButtonDirective };
let Button = class Button {
    constructor() {
        this.iconPos = 'left';
        this.onClick = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
    }
};
__decorate([
    Input()
], Button.prototype, "type", void 0);
__decorate([
    Input()
], Button.prototype, "iconPos", void 0);
__decorate([
    Input()
], Button.prototype, "icon", void 0);
__decorate([
    Input()
], Button.prototype, "label", void 0);
__decorate([
    Input()
], Button.prototype, "disabled", void 0);
__decorate([
    Input()
], Button.prototype, "style", void 0);
__decorate([
    Input()
], Button.prototype, "styleClass", void 0);
__decorate([
    Output()
], Button.prototype, "onClick", void 0);
__decorate([
    Output()
], Button.prototype, "onFocus", void 0);
__decorate([
    Output()
], Button.prototype, "onBlur", void 0);
Button = __decorate([
    Component({
        selector: 'p-button',
        template: `
        <button [attr.type]="type" [class]="styleClass" [ngStyle]="style" [disabled]="disabled"
            [ngClass]="{'ui-button ui-widget ui-state-default ui-corner-all':true,
                        'ui-button-icon-only': (icon && !label),
                        'ui-button-text-icon-left': (icon && label && iconPos === 'left'),
                        'ui-button-text-icon-right': (icon && label && iconPos === 'right'),
                        'ui-button-text-only': (!icon && label),
                        'ui-button-text-empty': (!icon && !label),
                        'ui-state-disabled': disabled}"
                        (click)="onClick.emit($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event)">
            <ng-content></ng-content>
            <span [ngClass]="{'ui-clickable': true,
                        'ui-button-icon-left': (iconPos === 'left'), 
                        'ui-button-icon-right': (iconPos === 'right')}"
                        [class]="icon" *ngIf="icon" [attr.aria-hidden]="true"></span>
            <span class="ui-button-text ui-clickable" [attr.aria-hidden]="icon && !label">{{label||'ui-btn'}}</span>
        </button>
    `,
        changeDetection: ChangeDetectionStrategy.Default
    })
], Button);
export { Button };
let ButtonModule = class ButtonModule {
};
ButtonModule = __decorate([
    NgModule({
        imports: [CommonModule],
        exports: [ButtonDirective, Button],
        declarations: [ButtonDirective, Button]
    })
], ButtonModule);
export { ButtonModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vcHJpbWVuZy9idXR0b24vIiwic291cmNlcyI6WyJidXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxZQUFZLEVBQUMsYUFBYSxFQUFDLE1BQU0sRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hKLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBSzdDLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7SUFZeEIsWUFBbUIsRUFBYztRQUFkLE9BQUUsR0FBRixFQUFFLENBQVk7UUFWeEIsWUFBTyxHQUFxQixNQUFNLENBQUM7UUFFbkMscUJBQWdCLEdBQVcsZUFBZSxDQUFDO0lBUWhCLENBQUM7SUFFckMsZUFBZTtRQUNYLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUMzRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELElBQUksWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1lBQzdGLFdBQVcsQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDckUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQzFCLFlBQVksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3BEO1FBQ0QsWUFBWSxDQUFDLFNBQVMsR0FBRyw2QkFBNkIsQ0FBQztRQUN2RCxZQUFZLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUM1QixDQUFDO0lBRUQsYUFBYTtRQUNULElBQUksVUFBVSxHQUFHLHVDQUF1QyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqRixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFFO2dCQUMvQyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksTUFBTTtvQkFDdEIsVUFBVSxHQUFHLFVBQVUsR0FBRywyQkFBMkIsQ0FBQzs7b0JBRXRELFVBQVUsR0FBRyxVQUFVLEdBQUcsNEJBQTRCLENBQUM7YUFDOUQ7aUJBQ0k7Z0JBQ0QsVUFBVSxHQUFHLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQzthQUNwRDtTQUNKO2FBQ0k7WUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1osVUFBVSxHQUFHLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQzthQUNwRDtpQkFDSTtnQkFDRCxVQUFVLEdBQUcsVUFBVSxHQUFHLHVCQUF1QixDQUFDO2FBQ3JEO1NBQ0o7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRVEsSUFBSSxLQUFLO1FBQ2QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxHQUFXO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBRWxCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFFMUYsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNiLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDdEUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO2lCQUNyRTtxQkFDSTtvQkFDRCxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLHNCQUFzQixDQUFDLENBQUM7b0JBQ25FLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUscUJBQXFCLENBQUMsQ0FBQztpQkFDeEU7YUFDSjtTQUNKO0lBQ0wsQ0FBQztJQUVRLElBQUksSUFBSTtRQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxJQUFJLENBQUMsR0FBVztRQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUVqQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQSxDQUFDLENBQUMscUJBQXFCLENBQUM7WUFDN0YsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQyxTQUFTO2dCQUNuRSxZQUFZLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNuRDtJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1AsT0FBTSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdEU7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUM3QixDQUFDO0NBQ0osQ0FBQTs7WUEzRjBCLFVBQVU7O0FBVnhCO0lBQVIsS0FBSyxFQUFFO2dEQUFvQztBQUVuQztJQUFSLEtBQUssRUFBRTt5REFBNEM7QUF1RDNDO0lBQVIsS0FBSyxFQUFFOzRDQUVQO0FBcUJRO0lBQVIsS0FBSyxFQUFFOzJDQUVQO0FBcEZRLGVBQWU7SUFIM0IsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLFdBQVc7S0FDeEIsQ0FBQztHQUNXLGVBQWUsQ0F1RzNCO1NBdkdZLGVBQWU7QUErSDVCLElBQWEsTUFBTSxHQUFuQixNQUFhLE1BQU07SUFBbkI7UUFJYSxZQUFPLEdBQVcsTUFBTSxDQUFDO1FBWXhCLFlBQU8sR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVoRCxZQUFPLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFaEQsV0FBTSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO0lBQzdELENBQUM7Q0FBQSxDQUFBO0FBbkJZO0lBQVIsS0FBSyxFQUFFO29DQUFjO0FBRWI7SUFBUixLQUFLLEVBQUU7dUNBQTBCO0FBRXpCO0lBQVIsS0FBSyxFQUFFO29DQUFjO0FBRWI7SUFBUixLQUFLLEVBQUU7cUNBQWU7QUFFZDtJQUFSLEtBQUssRUFBRTt3Q0FBbUI7QUFFbEI7SUFBUixLQUFLLEVBQUU7cUNBQVk7QUFFWDtJQUFSLEtBQUssRUFBRTswQ0FBb0I7QUFFbEI7SUFBVCxNQUFNLEVBQUU7dUNBQWlEO0FBRWhEO0lBQVQsTUFBTSxFQUFFO3VDQUFpRDtBQUVoRDtJQUFULE1BQU0sRUFBRTtzQ0FBZ0Q7QUFwQmhELE1BQU07SUF0QmxCLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FpQlQ7UUFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztLQUNuRCxDQUFDO0dBQ1csTUFBTSxDQXFCbEI7U0FyQlksTUFBTTtBQTRCbkIsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtDQUFJLENBQUE7QUFBaEIsWUFBWTtJQUx4QixRQUFRLENBQUM7UUFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdkIsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFDLE1BQU0sQ0FBQztRQUNqQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUMsTUFBTSxDQUFDO0tBQ3pDLENBQUM7R0FDVyxZQUFZLENBQUk7U0FBaEIsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsRGlyZWN0aXZlLENvbXBvbmVudCxFbGVtZW50UmVmLEV2ZW50RW1pdHRlcixBZnRlclZpZXdJbml0LE91dHB1dCxPbkRlc3Ryb3ksSW5wdXQsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEb21IYW5kbGVyfSBmcm9tICdwcmltZW5nL2RvbSc7XG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbcEJ1dHRvbl0nXG59KVxuZXhwb3J0IGNsYXNzIEJ1dHRvbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgICBASW5wdXQoKSBpY29uUG9zOiAnbGVmdCcgfCAncmlnaHQnID0gJ2xlZnQnO1xuICAgIFxuICAgIEBJbnB1dCgpIGNvcm5lclN0eWxlQ2xhc3M6IHN0cmluZyA9ICd1aS1jb3JuZXItYWxsJztcbiAgICAgICAgXG4gICAgcHVibGljIF9sYWJlbDogc3RyaW5nO1xuICAgIFxuICAgIHB1YmxpYyBfaWNvbjogc3RyaW5nO1xuICAgICAgICAgICAgXG4gICAgcHVibGljIGluaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmKSB7fVxuICAgIFxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgRG9tSGFuZGxlci5hZGRNdWx0aXBsZUNsYXNzZXModGhpcy5lbC5uYXRpdmVFbGVtZW50LCB0aGlzLmdldFN0eWxlQ2xhc3MoKSk7XG4gICAgICAgIGlmICh0aGlzLmljb24pIHtcbiAgICAgICAgICAgIGxldCBpY29uRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgICAgaWNvbkVsZW1lbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgbGV0IGljb25Qb3NDbGFzcyA9ICh0aGlzLmljb25Qb3MgPT0gJ3JpZ2h0JykgPyAndWktYnV0dG9uLWljb24tcmlnaHQnOiAndWktYnV0dG9uLWljb24tbGVmdCc7XG4gICAgICAgICAgICBpY29uRWxlbWVudC5jbGFzc05hbWUgPSBpY29uUG9zQ2xhc3MgICsgJyB1aS1jbGlja2FibGUgJyArIHRoaXMuaWNvbjtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChpY29uRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGxldCBsYWJlbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgaWYgKHRoaXMuaWNvbiAmJiAhdGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgbGFiZWxFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgICAgIGxhYmVsRWxlbWVudC5jbGFzc05hbWUgPSAndWktYnV0dG9uLXRleHQgdWktY2xpY2thYmxlJztcbiAgICAgICAgbGFiZWxFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMubGFiZWx8fCd1aS1idG4nKSk7XG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG4gICAgICAgIFxuICAgIGdldFN0eWxlQ2xhc3MoKTogc3RyaW5nIHtcbiAgICAgICAgbGV0IHN0eWxlQ2xhc3MgPSAndWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0ICcgKyB0aGlzLmNvcm5lclN0eWxlQ2xhc3M7XG4gICAgICAgIGlmICh0aGlzLmljb24pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxhYmVsICE9IG51bGwgJiYgdGhpcy5sYWJlbCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pY29uUG9zID09ICdsZWZ0JylcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVDbGFzcyA9IHN0eWxlQ2xhc3MgKyAnIHVpLWJ1dHRvbi10ZXh0LWljb24tbGVmdCc7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBzdHlsZUNsYXNzID0gc3R5bGVDbGFzcyArICcgdWktYnV0dG9uLXRleHQtaWNvbi1yaWdodCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZUNsYXNzID0gc3R5bGVDbGFzcyArICcgdWktYnV0dG9uLWljb24tb25seSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xuICAgICAgICAgICAgICAgIHN0eWxlQ2xhc3MgPSBzdHlsZUNsYXNzICsgJyB1aS1idXR0b24tdGV4dC1vbmx5JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlQ2xhc3MgPSBzdHlsZUNsYXNzICsgJyB1aS1idXR0b24tdGV4dC1lbXB0eSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzdHlsZUNsYXNzO1xuICAgIH1cbiAgICBcbiAgICBASW5wdXQoKSBnZXQgbGFiZWwoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhYmVsO1xuICAgIH1cblxuICAgIHNldCBsYWJlbCh2YWw6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9sYWJlbCA9IHZhbDtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5lbC5uYXRpdmVFbGVtZW50LCAnLnVpLWJ1dHRvbi10ZXh0JykudGV4dENvbnRlbnQgPSB0aGlzLl9sYWJlbDtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmljb24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsICd1aS1idXR0b24tdGV4dC1lbXB0eScpO1xuICAgICAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJ3VpLWJ1dHRvbi10ZXh0LW9ubHknKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3ModGhpcy5lbC5uYXRpdmVFbGVtZW50LCAndWktYnV0dG9uLXRleHQtZW1wdHknKTtcbiAgICAgICAgICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsICd1aS1idXR0b24tdGV4dC1vbmx5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIEBJbnB1dCgpIGdldCBpY29uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pY29uO1xuICAgIH1cblxuICAgIHNldCBpY29uKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2ljb24gPSB2YWw7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgbGV0IGljb25Qb3NDbGFzcyA9ICh0aGlzLmljb25Qb3MgPT0gJ3JpZ2h0JykgPyAndWktYnV0dG9uLWljb24tcmlnaHQnOiAndWktYnV0dG9uLWljb24tbGVmdCc7XG4gICAgICAgICAgICBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5lbC5uYXRpdmVFbGVtZW50LCAnLnVpLWNsaWNrYWJsZScpLmNsYXNzTmFtZSA9XG4gICAgICAgICAgICAgICAgaWNvblBvc0NsYXNzICsgJyB1aS1jbGlja2FibGUgJyArIHRoaXMuaWNvbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAgICAgXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHdoaWxlKHRoaXMuZWwubmF0aXZlRWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQubGFzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLWJ1dHRvbicsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGJ1dHRvbiBbYXR0ci50eXBlXT1cInR5cGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCJcbiAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsndWktYnV0dG9uIHVpLXdpZGdldCB1aS1zdGF0ZS1kZWZhdWx0IHVpLWNvcm5lci1hbGwnOnRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAndWktYnV0dG9uLWljb24tb25seSc6IChpY29uICYmICFsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAndWktYnV0dG9uLXRleHQtaWNvbi1sZWZ0JzogKGljb24gJiYgbGFiZWwgJiYgaWNvblBvcyA9PT0gJ2xlZnQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1aS1idXR0b24tdGV4dC1pY29uLXJpZ2h0JzogKGljb24gJiYgbGFiZWwgJiYgaWNvblBvcyA9PT0gJ3JpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAndWktYnV0dG9uLXRleHQtb25seSc6ICghaWNvbiAmJiBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICAndWktYnV0dG9uLXRleHQtZW1wdHknOiAoIWljb24gJiYgIWxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1aS1zdGF0ZS1kaXNhYmxlZCc6IGRpc2FibGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwib25DbGljay5lbWl0KCRldmVudClcIiAoZm9jdXMpPVwib25Gb2N1cy5lbWl0KCRldmVudClcIiAoYmx1cik9XCJvbkJsdXIuZW1pdCgkZXZlbnQpXCI+XG4gICAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICAgICAgICA8c3BhbiBbbmdDbGFzc109XCJ7J3VpLWNsaWNrYWJsZSc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAndWktYnV0dG9uLWljb24tbGVmdCc6IChpY29uUG9zID09PSAnbGVmdCcpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICd1aS1idXR0b24taWNvbi1yaWdodCc6IChpY29uUG9zID09PSAncmlnaHQnKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgW2NsYXNzXT1cImljb25cIiAqbmdJZj1cImljb25cIiBbYXR0ci5hcmlhLWhpZGRlbl09XCJ0cnVlXCI+PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1aS1idXR0b24tdGV4dCB1aS1jbGlja2FibGVcIiBbYXR0ci5hcmlhLWhpZGRlbl09XCJpY29uICYmICFsYWJlbFwiPnt7bGFiZWx8fCd1aS1idG4nfX08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgIGAsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIEJ1dHRvbiB7XG5cbiAgICBASW5wdXQoKSB0eXBlOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBpY29uUG9zOiBzdHJpbmcgPSAnbGVmdCc7XG5cbiAgICBASW5wdXQoKSBpY29uOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xuXG4gICAgQElucHV0KCkgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xuXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xuXG4gICAgQE91dHB1dCgpIG9uQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uQmx1cjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG59XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gICAgZXhwb3J0czogW0J1dHRvbkRpcmVjdGl2ZSxCdXR0b25dLFxuICAgIGRlY2xhcmF0aW9uczogW0J1dHRvbkRpcmVjdGl2ZSxCdXR0b25dXG59KVxuZXhwb3J0IGNsYXNzIEJ1dHRvbk1vZHVsZSB7IH1cbiJdfQ==