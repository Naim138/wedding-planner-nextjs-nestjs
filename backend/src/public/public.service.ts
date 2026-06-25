import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/models/Category.model';
import { Service } from 'src/models/Service.model';
import {Model} from 'mongoose'
import { getServiceByCategoryORServiceSlugDTO ,EnqueryFormDto,ServiceIdDTO} from 'src/dto/public.dto';
import { User } from 'src/models/User.model';
import { Profile } from 'src/models/Profile.model';
import { Enquery } from 'src/models/Enquery.model';

const demoCategories = [
  {
    slug: 'venues',
    name: 'Venues',
    desc: 'Community halls, convention centers, resorts, and rooftop spaces across Bangladesh.',
    image: { image_uri: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    slug: 'photography',
    name: 'Photography',
    desc: 'Wedding photographers and cinematographers for holud, nikah, reception, and outdoor shoots.',
    image: { image_uri: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    slug: 'decorators',
    name: 'Decorators',
    desc: 'Stage, gate, floral, lighting, and themed decor teams for Bangladeshi weddings.',
    image: { image_uri: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    slug: 'catering',
    name: 'Catering',
    desc: 'Kacchi, mezban, buffet, dessert, and live station catering for every guest count.',
    image: { image_uri: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    slug: 'makeup',
    name: 'Makeup',
    desc: 'Bridal makeup, groom grooming, family styling, and saree or sherwani draping.',
    image: { image_uri: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80' },
  },
  {
    slug: 'planning',
    name: 'Planning',
    desc: 'Full event planning, checklist, guest flow, vendor coordination, and day management.',
    image: { image_uri: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80' },
  },
];

const demoServices = [
  {
    _id: '667b00000000000000000001',
    slug: 'bashundhara-grand-hall',
    categorySlug: 'venues',
    title: 'Bashundhara Grand Hall',
    desc: 'A polished Dhaka convention venue for nikah, holud, and reception events with seating support for 500 guests, parking, generator backup, and vendor-friendly loading access.',
    budget: 280000,
    keywords: 'venue, dhaka, convention hall, reception',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Ahsan Habib Events', email: 'booking@ahsanevents.com', phone_no: '+8801711002200', address: { street: 'Bashundhara R/A, Dhaka' }, bio: 'Venue partner for premium city weddings.' },
    sections: [
      { title: 'Package Includes', content: 'Main hall booking, bride and groom rooms, standard lighting, sound connection, parking coordination, and security support.' },
      { title: 'Best For', content: 'Large Dhaka weddings, formal receptions, corporate-style seating plans, and families who want a predictable guest flow.' },
    ],
  },
  {
    _id: '667b00000000000000000002',
    slug: 'sylhet-tea-garden-resort-wedding',
    categorySlug: 'venues',
    title: 'Sylhet Tea Garden Resort Wedding',
    desc: 'A scenic outdoor resort venue for couples who want a softer destination wedding feel with mehendi, nikah, and photography spots in one location.',
    budget: 360000,
    keywords: 'venue, sylhet, resort, outdoor wedding',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Nafisa Rahman Hospitality', email: 'hello@sylhetweddings.com', phone_no: '+8801812334455', address: { street: 'Srimangal Road, Sylhet' }, bio: 'Destination wedding venue coordinator.' },
    sections: [
      { title: 'Package Includes', content: 'Lawn venue, resort coordination, couple suite, basic decor points, and vendor setup windows.' },
      { title: 'Best For', content: 'Outdoor holud, intimate nikah, tea garden portraits, and family stays.' },
    ],
  },
  {
    _id: '667b00000000000000000003',
    slug: 'frame-by-farhan-wedding-photography',
    categorySlug: 'photography',
    title: 'Frame by Farhan Wedding Photography',
    desc: 'Documentary photography and cinematic video for Bangladeshi wedding events, covering candid family moments, couple portraits, and ritual details.',
    budget: 95000,
    keywords: 'photographer, videography, wedding film',
    images: [
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Farhan Mahmud', email: 'farhan@framebd.com', phone_no: '+8801911223344', address: { street: 'Dhanmondi, Dhaka' }, bio: 'Lead photographer focused on natural wedding storytelling.' },
    sections: [
      { title: 'Package Includes', content: 'Two photographers, one cinematographer, event highlight film, edited album set, and online gallery delivery.' },
      { title: 'Coverage Style', content: 'Candid family emotion, stage portraits, couple session, decor detail shots, and short reels for social sharing.' },
    ],
  },
  {
    _id: '667b00000000000000000004',
    slug: 'rangdhanu-floral-decor',
    categorySlug: 'decorators',
    title: 'Rangdhanu Floral Decor',
    desc: 'Color-rich stage, gate, aisle, and table decor for holud, mehendi, nikah, and reception programs using fresh flowers, fabrics, and warm lighting.',
    budget: 125000,
    keywords: 'decorator, floral, stage, lighting',
    images: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Jannatul Ferdous', email: 'decor@rangdhanu.com', phone_no: '+8801715667788', address: { street: 'Mirpur DOHS, Dhaka' }, bio: 'Decorator specializing in colorful Bangladeshi wedding stages.' },
    sections: [
      { title: 'Package Includes', content: 'Stage backdrop, entry gate, couple seating, floral runners, guest table accents, and lighting plan.' },
      { title: 'Theme Options', content: 'Traditional holud yellow, royal red and gold, pastel nikah, garden reception, or custom family color palette.' },
    ],
  },
  {
    _id: '667b00000000000000000005',
    slug: 'dhaka-kacchi-and-buffet-catering',
    categorySlug: 'catering',
    title: 'Dhaka Kacchi & Buffet Catering',
    desc: 'Reliable wedding catering with kacchi, roast, rezala, borhani, kebab stations, desserts, and buffet service teams for 150 to 900 guests.',
    budget: 850,
    keywords: 'catering, kacchi, buffet, food',
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Sajjad Karim Catering', email: 'orders@sajjadcatering.com', phone_no: '+8801844556677', address: { street: 'Old Dhaka' }, bio: 'Catering team for high-volume wedding service.' },
    sections: [
      { title: 'Package Includes', content: 'Per-plate pricing, tasting session, buffet setup, serving staff, water station, and cleanup support.' },
      { title: 'Popular Menu', content: 'Kacchi biryani, chicken roast, beef rezala, jali kabab, borhani, firni, salad, and soft drinks.' },
    ],
  },
  {
    _id: '667b00000000000000000006',
    slug: 'nabila-bridal-makeup-studio',
    categorySlug: 'makeup',
    title: 'Nabila Bridal Makeup Studio',
    desc: 'HD bridal makeup, party makeup for family members, hijab or dupatta setting, saree draping, and groom grooming support.',
    budget: 45000,
    keywords: 'makeup, bridal, beauty, styling',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Nabila Chowdhury', email: 'studio@nabilabridal.com', phone_no: '+8801777889900', address: { street: 'Banani, Dhaka' }, bio: 'Bridal artist for elegant long-wear looks.' },
    sections: [
      { title: 'Package Includes', content: 'Bridal skin prep, HD makeup, hair setting, dupatta placement, false lashes, and final touch-up kit.' },
      { title: 'Best For', content: 'Nikah, reception, holud, engagement, and family party makeup.' },
    ],
  },
  {
    _id: '667b00000000000000000007',
    slug: 'shuvo-full-wedding-planner',
    categorySlug: 'planning',
    title: 'Shuvo Full Wedding Planner',
    desc: 'Full wedding coordination for busy families: vendor shortlist, booking tracking, event timeline, guest flow, budget planning, and day-of supervision.',
    budget: 70000,
    keywords: 'planner, coordinator, checklist, budget',
    images: [
      'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Shuvo Ahmed', email: 'plan@shuvoweddings.com', phone_no: '+8801677001122', address: { street: 'Uttara, Dhaka' }, bio: 'Wedding planner focused on practical family coordination.' },
    sections: [
      { title: 'Package Includes', content: 'Vendor matching, weekly planning calls, checklist, budget worksheet, event day timeline, and family contact sheet.' },
      { title: 'Best For', content: 'Couples planning multiple events who need one person to keep decisions, payments, and vendors aligned.' },
    ],
  },
  {
    _id: '667b00000000000000000008',
    slug: 'chattogram-mezban-wedding-caterers',
    categorySlug: 'catering',
    title: 'Chattogram Mezban Wedding Caterers',
    desc: 'Authentic mezban-style wedding catering with beef, dal, rice, roast, kebab, and fast plated service for large Chattogram family events.',
    budget: 720,
    keywords: 'catering, chattogram, mezban',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?auto=format&fit=crop&w=1400&q=80',
    ],
    vendor: { name: 'Mehedi Hasan', email: 'mezban@ctgweddings.com', phone_no: '+8801819003344', address: { street: 'GEC Circle, Chattogram' }, bio: 'Traditional Chattogram wedding catering team.' },
    sections: [
      { title: 'Package Includes', content: 'Per-plate mezban menu, cooking team, servers, buffet or plated setup, and service supervision.' },
      { title: 'Best For', content: 'Large family receptions, walima, and Chattogram-style community wedding meals.' },
    ],
  },
];

const categoryBySlug = (slug: string) => demoCategories.find((category) => category.slug.toLowerCase() === slug.toLowerCase());
const serviceListItem = (service: any) => ({
  _id: service._id,
  slug: service.slug,
  title: service.title,
  desc: service.desc,
  budget: service.budget,
  images: service.images[0],
  category: { slug: service.categorySlug },
});
const serviceDetailItem = (service: any) => ({
  _id: service._id,
  slug: service.slug,
  title: service.title,
  desc: service.desc,
  budget: service.budget,
  keywords: service.keywords,
  sections: service.sections,
  isPublish: true,
  images: service.images,
  user: service.vendor,
});

@Injectable()
export class PublicService {
    constructor(@InjectModel(Category.name) private readonly CategoryModel:Model<Category>,
    @InjectModel(Service.name) private readonly ServiceModel:Model<Service>,
    @InjectModel(User.name) private readonly UserModel:Model<User>,
    @InjectModel(Profile.name) private readonly ProfileModel:Model<Profile>,
    @InjectModel(Enquery.name) private readonly EnqueryModel:Model<Enquery>,
    
){}


    async popularServices(){

            const services = await this.ServiceModel.find({isPublish:true})
            .limit(4)
            .select("slug title images desc budget  category -_id")
            .populate("category","slug -_id")
            ;
            const new_arr:any[]=[]
            await Promise.all(services.map((cur)=>{
        
                const image = cur.images[0]?.uri 
                new_arr.push({
                    ...cur.toObject(),
                    images:image
                })
            }) )
     

            return new_arr.length > 0 ? new_arr : demoServices.slice(0, 6).map(serviceListItem)


    }
    async showAllServices(){

        const services = await this.ServiceModel.find({isPublish:true})
       
        .select("slug title images desc budget  category -_id")
            .populate("category","slug -_id")

        ;
        const new_arr:any[]=[]
        await Promise.all(services.map((cur)=>{
    
            const image = cur.images[0]?.uri 
            new_arr.push({
                ...cur.toObject(),
                images:image
            })
        }) )
 

        return new_arr.length > 0 ? new_arr : demoServices.map(serviceListItem)


}
    


    async popularCategories(){

        const categories = await this.CategoryModel.find({isPublic:true})
        .limit(4)
        .select("slug name image.image_uri desc -_id")
        
        ;
        return categories.length > 0 ? categories : demoCategories.slice(0, 4)


}

 async showAllCategories(){
    const categories = await this.CategoryModel.find({isPublic:true})
  
    .select("slug name image.image_uri desc -_id")
    
    ;
    return categories.length > 0 ? categories : demoCategories
 }

 
 async showAllServicesbySlug(slug:string){

    const category = await this.CategoryModel.findOne({
        slug:{
            $regex:slug,$options: 'i'
        }
    })
    if(!category){
        const demoCategory = categoryBySlug(slug);
        return demoCategory ? demoServices.filter((service) => service.categorySlug === demoCategory.slug).map(serviceListItem) : [];
    }

    const services = await this.ServiceModel.find({isPublish:true,
        
        category:category
    
    })
    
    .select("slug title images desc budget  category -_id")
    .populate("category","slug -_id")
    ;
    const new_arr:any[]=[]
    await Promise.all(services.map((cur)=>{

        const image = cur.images[0]?.uri 
        new_arr.push({
            ...cur.toObject(),
            images:image
        })
    }) )


    return new_arr.length > 0 ? new_arr : demoServices.filter((service) => service.categorySlug === category.slug).map(serviceListItem)


}

async getServiceByCategoryORServiceSlug(data:getServiceByCategoryORServiceSlugDTO){

        const category = await this.CategoryModel.findOne({
            slug:{  $regex:data.category,$options: 'i'},
            isPublic:true
        })

        if(!category){
            const demoService = demoServices.find((cur) => cur.categorySlug.toLowerCase() === data.category.toLowerCase() && cur.slug.toLowerCase() === data.service.toLowerCase());
            if (demoService) {
                return serviceDetailItem(demoService);
            }
            throw new NotFoundException("Category Not Found")
        }

        let service =  await this.ServiceModel.findOne({
            slug:{  $regex:data.service,$options: 'i'},
            category:category._id
        })
        .select("slug title user desc budget keywords images sections isPublish ")
        .populate("user","name email")

        //more service for same category PENDING Task

          
         

        
        
        if(!service){
            const demoService = demoServices.find((cur) => cur.categorySlug.toLowerCase() === category.slug.toLowerCase() && cur.slug.toLowerCase() === data.service.toLowerCase());
            if (demoService) {
                return serviceDetailItem(demoService);
            }
            throw new NotFoundException("Service Not Found")
        }
        const user = {
            name:service.user.name,
            email:service.user.email,
        }
        const userDetails = await this.ProfileModel.findOne({
            user:  service.user?._id
        })
        if(userDetails){

            user['avatar'] =userDetails.avatar.uri
            user['isEmailVerified'] =userDetails.isEmailVerified
            user['address'] =userDetails.address
            user['bio'] =userDetails.bio
            user['gender'] =userDetails.gender
            user['phone_no'] = userDetails.phone_no
        }
        const images:any=[]
        await Promise.all(service.images.map(async(cur,i)=>{
            images[i]  = cur.uri
        }))
       service['images'] =[] 

        return  {
            ...service.toObject(),
            images,
            user
        }
}

async addEnqueryDetails(data:EnqueryFormDto,service:string){
    // /data saved
    await this.EnqueryModel.create({
        ...data,
        service
    })
    return {
        msg:"Details Send Successfully :)"
    }
}
}
