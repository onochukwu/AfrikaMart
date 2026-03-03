import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';


@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  addItem(@Req() req, @Body() body) {
    return this.cartService.addItem(
      req.user.userId ?? req.user.sub,
      body.productId,
      body.quantity,
    );
  }

  @Get()
  viewCart(@Req() req) {
    return this.cartService.viewCart(req.user.userId ?? req.user.sub);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req,
    @Param('id') id: string,
    @Body() body,
  ) {
    return this.cartService.updateItem(
      req.user.userId ?? req.user.sub,
      id,
      body.quantity,
    );
  }

  @Delete('items/:id')
  removeItem(@Req() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId ?? req.user.sub, id);
  }
}
