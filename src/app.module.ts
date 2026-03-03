import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './common/modules/auth/auth.module';
import { UsersModule } from './common/modules/users/user.module';
import { MailModule } from './common/mail/mail.module';
import { ProductsModule } from './common/modules/products/products.module';
import { CategoriesModule } from './common/modules/categories/categories.module';
import { BrandsModule } from './common/modules/brands/brands.module';
import { CartModule } from './common/modules/cart/cart.module';
import { OrdersModule } from './common/modules/order/order.module';
import { SuppliersModule } from './common/modules/supplier/suppliers.module';
import { AdminModule } from './common/modules/admin/admin.module';
import { PaymentsModule } from './common/payments/payments.module';
import { InventoryModule } from './common/modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/afrikamart',
    ),
    UsersModule,
    AuthModule,
    MailModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    OrdersModule,
    SuppliersModule,
    AdminModule,
    PaymentsModule,
    InventoryModule,
  ],
})
export class AppModule {}
